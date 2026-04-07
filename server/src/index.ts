import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/index.js';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import estimateRouter from './routes/estimate.js';
import settingsRouter from './routes/settings.js';
import analyzeRouter from './routes/analyze.js';
import tasksRouter from './routes/tasks.js';

console.log('🔧 Initializing estiMATE server...');

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middleware
app.use(cors({
    origin: ['https://estimate-yjne.onrender.com'],
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database
let dbReady = false;
initializeDatabase().then(() => {
    dbReady = true;
    console.log('✅ Database initialized');
}).catch(err => {
    console.error('❌ Database initialization error:', err);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/estimate', estimateRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/analyze', analyzeRouter);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ 
        status: 'ok', 
        database: dbReady ? 'ready' : 'initializing',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`✅ estiMATE server running on http://localhost:${PORT}`);
    console.log(`📍 Available endpoints:`);
    console.log(`   POST /api/auth/register - Create account`);
    console.log(`   POST /api/auth/login - Login`);
    console.log(`   GET /api/auth/verify - Verify token`);
    console.log(`   GET /api/settings - Get user settings`);
    console.log(`   PATCH /api/settings - Update settings`);
    console.log(`   GET /api/projects - Get all projects`);
    console.log(`   POST /api/projects/add-manual - Add manual project`);
    console.log(`   POST /api/projects/add-github - Add GitHub project`);
    console.log(`   POST /api/projects/upload-csv - Upload CSV projects`);
    console.log(`   DELETE /api/projects/:id - Delete project`);
    console.log(`   PATCH /api/projects/:id/share - Share project`);
    console.log(`   POST /api/estimate - Calculate estimate`);
    console.log(`   GET /api/estimate/history - Get estimation history`);
    console.log(`   POST /api/tasks/generate - Generate task board`);
    console.log(`   GET /api/tasks/board/:id - Get task board`);
    console.log(`   PATCH /api/tasks/task/:id - Update task status`);
    console.log(`   GET /api/tasks/export/:id/csv - Export tasks as CSV`);
    console.log(`   POST /api/tasks/share/:id - Generate share link`);
    console.log(`   POST /api/analyze - Analyze GitHub repository`);
});

export default app;
