import { Router, Request, Response } from 'express';
import { query, run } from '../db/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get estimation history
router.get('/history', async (req: Request, res: Response) => {
    try {
        const result = await query(
            'SELECT * FROM estimation_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [(req as any).userId]
        ) as any;
        
        const rows = result.rows || result;
        const history = rows.map((row: any) => ({
            id: row.id,
            request_data: typeof row.request_data === 'string' ? JSON.parse(row.request_data) : row.request_data,
            result: typeof row.result === 'string' ? JSON.parse(row.result) : row.result,
            created_at: row.created_at
        }));
        
        res.json(history);
    } catch (err: any) {
        console.error('History fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// DELETE /api/estimate/:id - Delete estimation by ID
router.delete('/:id', async (req: Request, res: Response) => {
    const estimationId = parseInt(req.params.id);
    
    if (isNaN(estimationId)) {
        return res.status(400).json({
            error: 'INVALID_ID',
            message: 'Estimation ID must be a number',
        });
    }

    try {
        // Verify ownership and delete
        await run(
            'DELETE FROM estimation_history WHERE id = ? AND user_id = ?',
            [estimationId, req.userId]
        );

        res.json({
            success: true,
            message: 'Estimation deleted successfully',
        });
    } catch (err: any) {
        console.error('Estimation delete error:', err);
        res.status(500).json({ error: 'Failed to delete estimation' });
    }
});

interface EstimateRequest {
    projectType: string;
    estimatedLOC: number;
    deadline?: string;
    teamSize: number;
}

// Calculate velocity from similar projects
async function calculateVelocity(userId: number): Promise<{
    linesPerDay: number;
    avgCycleTime: number;
}> {
    try {
        const result = await query(
            `SELECT AVG(CAST(loc AS FLOAT) / actual_days) as lines_per_day,
                    AVG(actual_days) as avg_cycle_time
             FROM projects WHERE user_id = ? OR (user_id IS NULL AND is_shared = 1)`,
            [userId]
        );

        const rows = ((result as any)?.rows as any[] || []);
        if (rows.length === 0) {
            return { linesPerDay: 100, avgCycleTime: 7 };
        }

        return {
            linesPerDay: rows[0].lines_per_day || 100,
            avgCycleTime: rows[0].avg_cycle_time || 7,
        };
    } catch {
        return { linesPerDay: 100, avgCycleTime: 7 };
    }
}

// Find similar projects for comparison
async function findSimilarProjects(
    userId: number,
    projectType: string,
    loc: number
): Promise<{ crowdCount: number; crowdSamples: any[]; userProjectCount: number; userProjects: any[] }> {
    try {
        // Find similar projects by type and LOC (within 20% range)
        const minLoc = loc * 0.8;
        const maxLoc = loc * 1.2;

        const seedResult = await query(
            `SELECT name, project_type, loc, actual_days, actual_people
             FROM projects WHERE is_shared = 1 AND user_id IS NULL AND project_type = ? AND loc BETWEEN ? AND ?
             LIMIT 3`,
            [projectType, minLoc, maxLoc]
        );

        const userResult = await query(
            `SELECT name, project_type, loc, actual_days, actual_people
             FROM projects WHERE user_id = ? AND source IN ('csv', 'manual', 'github') AND project_type = ? AND loc BETWEEN ? AND ?
             LIMIT 3`,
            [userId, projectType, minLoc, maxLoc]
        );

        return {
            crowdCount: ((seedResult as any)?.rows as any[] || []).length,
            crowdSamples: ((seedResult as any)?.rows as any[] || []),
            userProjectCount: ((userResult as any)?.rows as any[] || []).length,
            userProjects: ((userResult as any)?.rows as any[] || []),
        };
    } catch {
        return {
            crowdCount: 0,
            crowdSamples: [],
            userProjectCount: 0,
            userProjects: [],
        };
    }
}

// POST /api/estimate - Calculate project estimate
router.post('/', async (req: Request, res: Response) => {
    const { projectType, estimatedLOC, deadline, teamSize } = req.body as EstimateRequest;

    // Validation
    if (!projectType || !estimatedLOC || !teamSize) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'projectType, estimatedLOC, and teamSize are required',
        });
    }

    // Check tier limits
    try {
        const userResult = await query('SELECT subscription_tier FROM users WHERE id = ?', [req.userId]) as any;
        const userRows = userResult?.rows || userResult || [];
        const user = Array.isArray(userRows) ? userRows[0] : userRows;
        const tier = user?.subscription_tier || 'free';

        if (tier === 'free') {
            const historyResult = await query(
                'SELECT COUNT(*) as count FROM estimation_history WHERE user_id = ?',
                [req.userId]
            ) as any;
            const historyRows = historyResult?.rows || historyResult || [];
            const historyCount = Array.isArray(historyRows) ? historyRows[0]?.count : historyRows?.count || 0;

            if (historyCount >= 10) {
                return res.status(403).json({
                    error: 'LIMIT_EXCEEDED',
                    message: 'Free tier limited to 10 estimations. Upgrade to Premium for unlimited.',
                    current: historyCount,
                    limit: 10,
                });
            }
        }
    } catch (limitErr) {
        console.warn('Failed to check tier limits:', limitErr);
        // Continue without blocking on limit check
    }

    if (!['feature', 'refactor', 'infrastructure', 'research', 'bugfix'].includes(projectType)) {
        return res.status(400).json({
            error: 'INVALID_TYPE',
            message: 'Invalid project type',
        });
    }

    if (teamSize < 1) {
        return res.status(400).json({
            error: 'INVALID_TEAM',
            message: 'Team size must be at least 1',
        });
    }

    try {
        // Get velocity
        const velocity = await calculateVelocity(req.userId!);

        // Calculate base estimate
        const baseEstimate = Math.ceil(estimatedLOC / velocity.linesPerDay);

        // Apply team efficiency factor (diminishing returns)
        const teamEfficiency = 1 + Math.log10(Math.max(1, teamSize)) * 0.3;
        const teamAdjustedEstimate = Math.ceil(baseEstimate / teamEfficiency);

        // Get similar projects for confidence
        const similar = await findSimilarProjects(req.userId!, projectType, estimatedLOC);

        // Calculate confidence based on similar projects
        const totalSimilar = similar.crowdCount + similar.userProjectCount;
        let confidence = 'Low';
        if (totalSimilar >= 5) confidence = 'High';
        else if (totalSimilar >= 2) confidence = 'Medium';

        // Confidence as percentage
        const confidenceScore = totalSimilar >= 5 ? 85 : totalSimilar >= 2 ? 60 : 40;

        // Estimate people needed
        let peopleNeeded = teamSize;
        let deadlineFeasible = true;
        let daysAvailable = 0;

        if (deadline) {
            const deadlineDate = new Date(deadline);
            const today = new Date();
            daysAvailable = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysAvailable > 0) {
                // Calculate people needed to hit deadline
                peopleNeeded = Math.ceil((baseEstimate * teamEfficiency) / daysAvailable);
                deadlineFeasible = peopleNeeded <= teamSize;
            }
        }

        // Save estimation to history
        try {
            await run(
                `INSERT INTO estimation_history (user_id, request_data, result)
                 VALUES (?, ?, ?)`,
                [
                    req.userId,
                    JSON.stringify({ projectType, estimatedLOC, deadline, teamSize }),
                    JSON.stringify({
                        estimatedDays: teamAdjustedEstimate,
                        confidence: confidenceScore,
                        peopleForDeadline: peopleNeeded,
                    }),
                ]
            );
        } catch (historyErr) {
            console.warn('Failed to save estimation history:', historyErr);
        }

        res.json({
            estimatedDays: teamAdjustedEstimate,
            estimatedPeople: Math.ceil(teamAdjustedEstimate / 5), // rough team sizing
            confidence: confidenceScore,
            velocity: velocity.linesPerDay,
            avgCycleTime: velocity.avgCycleTime,
            crowdCount: similar.crowdCount,
            userProjectCount: similar.userProjectCount,
            crowdSamples: similar.crowdSamples,
            userProjects: similar.userProjects,
            peopleForDeadline: peopleNeeded,
            daysAvailable,
            deadlineFeasible,
        });
    } catch (error: any) {
        console.error('Estimate calculation error:', error);
        res.status(500).json({
            error: 'ESTIMATION_ERROR',
            message: error.message || 'Failed to calculate estimate',
        });
    }
});

// DELETE /api/estimate/:id - Delete estimation by ID
router.delete('/:id', async (req: Request, res: Response) => {
    const estimationId = parseInt(req.params.id);
    
    if (isNaN(estimationId)) {
        return res.status(400).json({
            error: 'INVALID_ID',
            message: 'Estimation ID must be a number',
        });
    }

    try {
        // Verify ownership and delete
        await run(
            'DELETE FROM estimation_history WHERE id = ? AND user_id = ?',
            [estimationId, req.userId]
        );

        res.json({
            success: true,
            message: 'Estimation deleted successfully',
        });
    } catch (err: any) {
        console.error('Estimation delete error:', err);
        res.status(500).json({ error: 'Failed to delete estimation' });
    }
});

export default router;
