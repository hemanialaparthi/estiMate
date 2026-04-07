import express, { Request, Response } from 'express';
import { query, run } from '../db/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate task board from project
router.post('/generate', verifyToken, async (req: Request, res: Response) => {
    try {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ error: 'projectId required' });

        // Get project details
        const projectResult = await query(
            'SELECT * FROM projects WHERE id = ? AND user_id = ?',
            [projectId, (req as any).userId]
        ) as any;
        
        const projects = projectResult.rows || projectResult;
        if (!projects || projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = projects[0];
        const boardId = `board_${projectId}_${Date.now()}`;

        // Generate tasks based on project type and size
        const tasksToInsert = generateTasks(project, boardId);

        // Save tasks to database
        for (const task of tasksToInsert) {
            await run(
                `INSERT INTO tasks (user_id, project_id, board_id, title, description, category, status, estimated_days, order_num)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [(req as any).userId, projectId, boardId, task.title, task.description, task.category, task.status, task.estimated_days, task.order_num]
            );
        }

        // Fetch the created tasks to get their IDs
        const tasksResult = await query(
            'SELECT * FROM tasks WHERE board_id = ? AND user_id = ? ORDER BY order_num',
            [boardId, (req as any).userId]
        ) as any;
        const tasks = tasksResult.rows || tasksResult;

        return res.status(201).json({
            boardId,
            projectId,
            projectName: project.name,
            projectType: project.project_type,
            totalEstimatedDays: tasks.reduce((sum: number, t: any) => sum + (t.estimated_days || 0), 0),
            taskCount: tasks.length,
            tasks
        });
    } catch (err: any) {
        console.error('Task generation error:', err);
        res.status(500).json({ error: 'Task generation failed' });
    }
});

// Get tasks for a board
router.get('/board/:boardId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;
        
        const tasksResult = await query(
            'SELECT * FROM tasks WHERE board_id = ? AND user_id = ? ORDER BY order_num',
            [boardId, (req as any).userId]
        ) as any;

        const tasks = tasksResult.rows || tasksResult;
        return res.json({ boardId, tasks, count: tasks.length });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Update task status
router.patch('/task/:taskId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const { status, assignedTo } = req.body;

        if (status && !['todo', 'in_progress', 'done'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        let updateQuery = 'UPDATE tasks SET ';
        const params: any[] = [];
        const updates: string[] = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        if (assignedTo !== undefined) {
            updates.push('assigned_to = ?');
            params.push(assignedTo);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        updateQuery += updates.join(', ') + ' WHERE id = ? AND user_id = ?';
        params.push(taskId, (req as any).userId);

        await run(updateQuery, params);
        
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Export task board as CSV
router.get('/export/:boardId/csv', verifyToken, async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;

        const tasksResult = await query(
            'SELECT * FROM tasks WHERE board_id = ? AND user_id = ? ORDER BY order_num',
            [boardId, (req as any).userId]
        ) as any;

        const tasks = tasksResult.rows || tasksResult;
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }

        // Get project info
        const projectId = tasks[0].project_id;
        const projectResult = await query('SELECT name FROM projects WHERE id = ?', [projectId]) as any;
        const projects = projectResult.rows || projectResult;
        const projectName = projects.length > 0 ? projects[0].name : 'Project';

        // Generate CSV
        const headers = ['Task', 'Category', 'Status', 'Days', 'Assigned To', 'Description'];
        const rows = tasks.map((t: any) => [
            t.title,
            t.category,
            t.status,
            t.estimated_days || '',
            t.assigned_to || '',
            t.description || ''
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="taskboard-${projectName}-${Date.now()}.csv"`);
        res.send(csv);
    } catch (err: any) {
        res.status(500).json({ error: 'Export failed' });
    }
});

// Generate shareable link (just return a link format)
router.post('/share/:boardId', verifyToken, async (req: Request, res: Response) => {
    try {
        const { boardId } = req.params;
        const shareToken = Buffer.from(boardId).toString('base64');
        
        res.json({
            shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/taskboard/${boardId}`,
            shareToken,
            boardId
        });
    } catch (err: any) {
        res.status(500).json({ error: 'Share generation failed' });
    }
});

// Helper function to generate tasks based on project characteristics
function generateTasks(project: any, boardId: string) {
    const tasks: any[] = [];
    const loc = project.loc || 1000;
    const projectType = project.project_type || 'feature';
    let orderNum = 0;

    // Time allocation percentages by phase (varies by project type)
    const allocations = getTimeAllocations(projectType);

    // Calculate base duration for each phase
    const estimatedDays = Math.max(5, Math.ceil(loc / 200)); // Base estimate: 200 LOC per day average

    // Design phase
    const designDays = Math.ceil(estimatedDays * allocations.design);
    tasks.push({
        title: 'UI/UX Specification',
        description: 'Create wireframes, mockups, and design system documentation',
        category: 'Design',
        status: 'todo',
        estimated_days: designDays * 0.6,
        order_num: orderNum++
    });
    tasks.push({
        title: 'Database Schema Design',
        description: 'Design database schema, relationships, and indices',
        category: 'Design',
        status: 'todo',
        estimated_days: designDays * 0.4,
        order_num: orderNum++
    });

    // Backend tasks
    const backendDays = Math.ceil(estimatedDays * allocations.backend);
    tasks.push({
        title: 'API Architecture & Setup',
        description: 'Design API endpoints, authentication, and middleware',
        category: 'Backend',
        status: 'todo',
        estimated_days: backendDays * 0.2,
        order_num: orderNum++
    });
    const locPerBackendTask = Math.max(50, Math.ceil(loc * 0.4 / 3));
    for (let i = 0; i < 3; i++) {
        tasks.push({
            title: `Backend Module ${i + 1} (${locPerBackendTask} LOC)`,
            description: `Implement core backend functionality - Module ${i + 1}`,
            category: 'Backend',
            status: 'todo',
            estimated_days: Math.ceil((backendDays * 0.8) / 3),
            order_num: orderNum++
        });
    }

    // Frontend tasks
    const frontendDays = Math.ceil(estimatedDays * allocations.frontend);
    tasks.push({
        title: 'Frontend Architecture Setup',
        description: 'Setup component library, state management, and routing',
        category: 'Frontend',
        status: 'todo',
        estimated_days: frontendDays * 0.2,
        order_num: orderNum++
    });
    const locPerFrontendTask = Math.max(50, Math.ceil(loc * 0.3 / 3));
    for (let i = 0; i < 3; i++) {
        tasks.push({
            title: `Frontend Feature ${i + 1} (${locPerFrontendTask} LOC)`,
            description: `Build user interface components - Feature ${i + 1}`,
            category: 'Frontend',
            status: 'todo',
            estimated_days: Math.ceil((frontendDays * 0.8) / 3),
            order_num: orderNum++
        });
    }

    // Testing tasks
    const testingDays = Math.ceil(estimatedDays * allocations.testing);
    tasks.push({
        title: 'Unit Tests',
        description: 'Write unit tests for core business logic',
        category: 'Testing',
        status: 'todo',
        estimated_days: testingDays * 0.4,
        order_num: orderNum++
    });
    tasks.push({
        title: 'Integration Tests',
        description: 'Write integration tests for API and components',
        category: 'Testing',
        status: 'todo',
        estimated_days: testingDays * 0.3,
        order_num: orderNum++
    });
    tasks.push({
        title: 'End-to-End Tests & QA',
        description: 'Run E2E tests and manual QA',
        category: 'Testing',
        status: 'todo',
        estimated_days: testingDays * 0.3,
        order_num: orderNum++
    });

    // DevOps/Deployment
    const devopsDays = Math.ceil(estimatedDays * allocations.devops);
    tasks.push({
        title: 'CI/CD Pipeline Setup',
        description: 'Configure automated build, test, and deployment',
        category: 'DevOps',
        status: 'todo',
        estimated_days: devopsDays * 0.5,
        order_num: orderNum++
    });
    tasks.push({
        title: 'Production Deployment',
        description: 'Deploy to production and monitor',
        category: 'DevOps',
        status: 'todo',
        estimated_days: devopsDays * 0.5,
        order_num: orderNum++
    });

    return tasks;
}

// Get time allocations based on project type
function getTimeAllocations(projectType: string) {
    const allocations = {
        feature: { design: 0.15, backend: 0.35, frontend: 0.35, testing: 0.10, devops: 0.05 },
        refactor: { design: 0.05, backend: 0.50, frontend: 0.15, testing: 0.20, devops: 0.10 },
        infrastructure: { design: 0.20, backend: 0.10, frontend: 0.00, testing: 0.10, devops: 0.60 },
        research: { design: 0.30, backend: 0.25, frontend: 0.25, testing: 0.10, devops: 0.10 },
        bugfix: { design: 0.05, backend: 0.40, frontend: 0.20, testing: 0.30, devops: 0.05 }
    };

    return allocations[projectType as keyof typeof allocations] || allocations.feature;
}

export default router;
