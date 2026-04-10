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

console.log('🔧 Initializing estiMate server...');

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middleware
const allowedOrigins = [
    'https://esti-mate-client.vercel.app',
    'https://estimate-yjne.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database ready state
let dbReady = false;

// Middleware to check database readiness
const ensureDbReady = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!dbReady) {
        return res.status(503).json({ error: 'Database initializing, please retry' });
    }
    next();
};

// Initialize database BEFORE routes
let dbInitPromise = initializeDatabase()
    .then(() => {
        dbReady = true;
        console.log('✅ Database initialized successfully');
    })
    .catch(err => {
        console.error('❌ Database initialization error:', err);
        process.exit(1);
    });

// Routes - all protected by database ready check
app.use('/api/auth', ensureDbReady, authRouter);
app.use('/api/projects', ensureDbReady, projectsRouter);
app.use('/api/estimate', ensureDbReady, estimateRouter);
app.use('/api/settings', ensureDbReady, settingsRouter);
app.use('/api/tasks', ensureDbReady, tasksRouter);
app.use('/api/analyze', ensureDbReady, analyzeRouter);

// Health check - accessible even if DB not ready
app.get('/api/health', (_req, res) => {
    if (!dbReady) {
        return res.status(503).json({ 
            status: 'initializing', 
            database: 'initializing',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
    res.json({ 
        status: 'ok', 
        database: 'ready',
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

// Startup - wait for DB before listening
function startServer() {
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
}

// Start server after DB initializes
dbInitPromise.then(() => {
    startServer();
}).catch(() => {
    console.error('Failed to start server - database initialization failed');
    process.exit(1);
});

export default app;
