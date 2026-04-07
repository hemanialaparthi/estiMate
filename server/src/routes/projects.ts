import { Router, Request, Response } from 'express';
import { query, run } from '../db/index.js';
import { verifyToken } from '../middleware/auth.js';
import axios from 'axios';
import { analyzeGitHubRepo } from '../services/github-service.js';

const router = Router();

// Apply auth middleware to all routes
router.use(verifyToken);

interface Project {
    id: number;
    name: string;
    source: string;
    project_type: string;
    loc: number;
    actual_days: number;
    actual_people: number;
    is_shared: boolean;
    created_at: string;
}

// GET /api/projects - Get all projects
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await query(
            `SELECT id, name, source, project_type, loc, actual_days, actual_people, is_shared, created_at 
             FROM projects WHERE user_id = ? OR (is_shared = 1 AND user_id IS NULL) ORDER BY created_at DESC LIMIT 100`,
            [req.userId]
        );
        
        const projects = ((result as any)?.rows as any[] || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            source: p.source,
            project_type: p.project_type,
            loc: p.loc,
            actual_days: p.actual_days,
            actual_people: p.actual_people,
            is_shared: Boolean(p.is_shared),
            created_at: p.created_at,
        }));

        res.json({
            projects,
            total: projects.length,
            limit: 100,
        });
    } catch (error: any) {
        console.error('Projects fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// POST /api/projects/add-manual - Add manual project entry
router.post('/add-manual', async (req: Request, res: Response) => {
    const { projectName, projectType, estimatedLOC, actualDays, actualPeople } = req.body;

    // Validation
    if (!projectName || !projectType || !estimatedLOC || !actualDays || !actualPeople) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'Missing required fields: projectName, projectType, estimatedLOC, actualDays, actualPeople',
        });
    }

    if (!['feature', 'refactor', 'infrastructure', 'research', 'bugfix'].includes(projectType)) {
        return res.status(400).json({
            error: 'INVALID_TYPE',
            message: 'Invalid project type',
        });
    }

    try {
        const result = await run(
            `INSERT INTO projects (user_id, source, project_type, name, loc, actual_days, actual_people, is_shared)
             VALUES (?, 'manual', ?, ?, ?, ?, ?, 0)`,
            [req.userId, projectType, projectName, estimatedLOC, actualDays, actualPeople]
        );

        res.status(201).json({
            success: true,
            projectId: result.lastID,
            message: 'Project added successfully',
        });
    } catch (error: any) {
        console.error('Manual project add error:', error);
        res.status(500).json({ error: 'Failed to add project' });
    }
});

// POST /api/projects/add-github - Import GitHub repository
router.post('/add-github', async (req: Request, res: Response) => {
    const { repoUrl } = req.body;

    if (!repoUrl || typeof repoUrl !== 'string') {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'GitHub repository URL is required',
        });
    }

    try {
        // Extract owner and repo from URL
        const urlMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!urlMatch) {
            return res.status(400).json({
                error: 'INVALID_URL',
                message: 'Invalid GitHub URL format. Use: https://github.com/owner/repo',
            });
        }

        const [, owner, repo] = urlMatch;
        const repoName = `${owner}/${repo}`;

        // Fetch repository metadata
        const octokit = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        // Get repo info
        const repoRes = await octokit.get(`/repos/${owner}/${repo}`);
        const repoData = repoRes.data;

        // Estimate from GitHub data
        const features = [
            { name: 'Repository Analysis', lines: repoData.size || 1000 },
        ];

        const result = await analyzeGitHubRepo(repoUrl, features, 3);

        // Create a project from the analysis
        const projectName = `${repoName} - Analysis`;
        const estimatedDays = result.estimated_days;
        const avgPeople = Math.ceil(result.estimated_days / 7); // Rough estimate

        const dbRes = await run(
            `INSERT INTO projects (user_id, source, project_type, name, loc, actual_days, actual_people, is_shared)
             VALUES (?, 'github', 'feature', ?, ?, ?, ?, 0)`,
            [req.userId, projectName, repoData.size || 1000, estimatedDays, avgPeople]
        );

        res.status(201).json({
            success: true,
            projectId: dbRes.lastID,
            repo: repoName,
            inserted: 1,
            message: 'GitHub repository analysis added as project',
            analysis: result,
        });
    } catch (error: any) {
        console.error('GitHub import error:', error.message);

        if (error.message.includes('RATE_LIMITED')) {
            return res.status(429).json({
                error: 'RATE_LIMITED',
                message: 'GitHub API rate limit exceeded',
            });
        }

        if (error.message.includes('NOT_FOUND')) {
            return res.status(404).json({
                error: 'REPO_NOT_FOUND',
                message: 'Repository not found',
            });
        }

        res.status(500).json({
            error: 'IMPORT_ERROR',
            message: error.message || 'Failed to import GitHub repository',
        });
    }
});

// POST /api/projects/upload-csv - Upload CSV file with projects
router.post('/upload-csv', async (req: Request, res: Response) => {
    try {
        // Parse CSV from request body
        const { csvData } = req.body;

        if (!csvData || typeof csvData !== 'string') {
            return res.status(400).json({
                error: 'INVALID_REQUEST',
                message: 'CSV data is required',
            });
        }

        const lines = csvData.trim().split('\n');
        if (lines.length < 2) {
            return res.status(400).json({
                error: 'INVALID_CSV',
                message: 'CSV file must have header row and at least one data row',
            });
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = header.findIndex(h => h.includes('name') || h.includes('project'));
        const typeIdx = header.findIndex(h => h.includes('type'));
        const locIdx = header.findIndex(h => h.includes('loc') || h.includes('size') || h.includes('lines'));
        const daysIdx = header.findIndex(h => h.includes('days') || h.includes('duration'));
        const peopleIdx = header.findIndex(h => h.includes('people') || h.includes('team'));

        if (nameIdx === -1 || locIdx === -1 || daysIdx === -1 || peopleIdx === -1) {
            return res.status(400).json({
                error: 'INVALID_CSV',
                message: 'CSV must have columns: name (or project), loc (or size), days (or duration), people (or team)',
            });
        }

        let inserted = 0;
        let skipped = 0;

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const fields = line.split(',').map(f => f.trim());
            const projectName = fields[nameIdx];
            const projectType = typeIdx >= 0 ? fields[typeIdx] : 'feature';
            const loc = parseInt(fields[locIdx], 10);
            const days = parseInt(fields[daysIdx], 10);
            const people = parseInt(fields[peopleIdx], 10);

            // Validate
            if (!projectName || isNaN(loc) || isNaN(days) || isNaN(people)) {
                skipped++;
                continue;
            }

            const validType = ['feature', 'refactor', 'infrastructure', 'research', 'bugfix'].includes(projectType)
                ? projectType
                : 'feature';

            try {
                await run(
                    `INSERT INTO projects (user_id, source, project_type, name, loc, actual_days, actual_people, is_shared)
                     VALUES (?, 'csv', ?, ?, ?, ?, ?, 0)`,
                    [req.userId, validType, projectName, loc, days, people]
                );
                inserted++;
            } catch {
                skipped++;
            }
        }

        res.status(201).json({
            success: true,
            inserted,
            skipped,
            message: `Imported ${inserted} projects (${skipped} skipped)`,
        });
    } catch (error: any) {
        console.error('CSV upload error:', error);
        res.status(500).json({
            error: 'UPLOAD_ERROR',
            message: 'Failed to process CSV file',
        });
    }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'Valid project ID is required',
        });
    }

    try {
        const result = await run(
            'DELETE FROM projects WHERE id = ? AND user_id = ?',
            [parseInt(id), req.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: 'Project not found',
            });
        }

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error: any) {
        console.error('Project delete error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// PATCH /api/projects/:id/share - Toggle project share status
router.patch('/:id/share', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isShared } = req.body;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'Valid project ID is required',
        });
    }

    try {
        const result = await run(
            'UPDATE projects SET is_shared = ? WHERE id = ? AND user_id = ?',
            [isShared ? 1 : 0, parseInt(id), req.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: 'Project not found',
            });
        }

        res.json({ success: true, isShared, message: 'Project share status updated' });
    } catch (error: any) {
        console.error('Project share error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

export default router;
