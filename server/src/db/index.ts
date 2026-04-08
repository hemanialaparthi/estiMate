// @ts-ignore
import path from 'path';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import { createRequire } from 'module';
// @ts-ignore
import pkg from 'pg';
const { Client } = pkg;
const require = createRequire(import.meta.url);

let db: any;
let isPostgres = false;

// Detect if we should use PostgreSQL or SQLite
const isDev = !process.env.DATABASE_URL;

if (isDev) {
    // Use SQLite for local development
    try {
        const sqlite3 = require('sqlite3').verbose();
        
        // Create data directory - use 'data' folder in server root
        const dataDir = path.join(process.cwd(), 'server', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dbPath = path.join(dataDir, 'estimates.db');
        db = new sqlite3.Database(dbPath);

        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
        console.log('✅ Using SQLite for local development');
    } catch (err) {
        console.warn('⚠️  SQLite not available, falling back to PostgreSQL:', (err as any).message);
        isPostgres = true;
    }
} else {
    // Use PostgreSQL on Render
    isPostgres = true;
    console.log('✅ Using PostgreSQL for production');
}

// PostgreSQL connection pool
let pgClient: any = null;

async function getPgClient() {
    if (!pgClient && process.env.DATABASE_URL) {
        pgClient = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_URL.includes('render.com') ? { rejectUnauthorized: false } : false
        });
        await pgClient.connect();
    }
    if (!pgClient) {
        throw new Error('PostgreSQL DATABASE_URL not configured');
    }
    return pgClient;
}

// Initialize database schema
export async function initializeDatabase() {
    if (isPostgres) {
        // Only initialize PostgreSQL if DATABASE_URL is configured
        if (!process.env.DATABASE_URL) {
            if (isDev) {
                console.warn('⚠️  DATABASE_URL not set on local dev - skipping database initialization');
                console.warn('   Run on Render with DATABASE_URL set to enable PostgreSQL');
                return;
            } else {
                throw new Error('DATABASE_URL must be set in production');
            }
        }
        
        const client = await getPgClient();
        
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS projects (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER,
                    source TEXT NOT NULL CHECK (source IN ('github', 'csv', 'manual', 'seed')),
                    project_type TEXT NOT NULL CHECK (project_type IN ('feature', 'refactor', 'infrastructure', 'research', 'bugfix')),
                    name TEXT,
                    loc INTEGER NOT NULL,
                    actual_days INTEGER NOT NULL,
                    actual_people INTEGER NOT NULL,
                    is_shared INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS estimation_history (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER,
                    request_data TEXT NOT NULL,
                    result TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    project_id INTEGER NOT NULL,
                    board_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    category TEXT NOT NULL CHECK (category IN ('Design', 'Backend', 'Frontend', 'Testing', 'DevOps')),
                    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
                    assigned_to TEXT,
                    estimated_days REAL,
                    depends_on INTEGER,
                    order_num INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                )
            `);

            console.log('✅ PostgreSQL database initialized');
        } catch (err) {
            console.error('❌ PostgreSQL schema error:', err);
            throw err;
        }
    } else {
        // SQLite initialization (keep existing logic)
        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                // Users table
                db.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Projects table
                db.run(`
                    CREATE TABLE IF NOT EXISTS projects (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER,
                        source TEXT NOT NULL CHECK (source IN ('github', 'csv', 'manual', 'seed')),
                        project_type TEXT NOT NULL CHECK (project_type IN ('feature', 'refactor', 'infrastructure', 'research', 'bugfix')),
                        name TEXT,
                        loc INTEGER NOT NULL,
                        actual_days INTEGER NOT NULL,
                        actual_people INTEGER NOT NULL,
                        is_shared INTEGER DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Estimation history table
                db.run(`
                    CREATE TABLE IF NOT EXISTS estimation_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER,
                        request_data TEXT NOT NULL,
                        result TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Tasks table
                db.run(`
                    CREATE TABLE IF NOT EXISTS tasks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        project_id INTEGER NOT NULL,
                        board_id TEXT NOT NULL,
                        title TEXT NOT NULL,
                        description TEXT,
                        category TEXT NOT NULL CHECK (category IN ('Design', 'Backend', 'Frontend', 'Testing', 'DevOps')),
                        status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
                        assigned_to TEXT,
                        estimated_days REAL,
                        depends_on INTEGER,
                        order_num INTEGER,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ SQLite schema error:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }
}

// Query data
export const query = async (sql: string, params: unknown[] = []) => {
    if (isPostgres) {
        const client = await getPgClient();
        try {
            // Convert SQLite placeholders (?) to PostgreSQL placeholders ($1, $2, etc)
            let paramIndex = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
            
            const result = await client.query(pgSql, params);
            return { rows: result.rows || [] };
        } catch (err) {
            console.error('Query error:', err, 'SQL:', sql);
            throw err;
        }
    } else {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err: any, rows: any) => {
                if (err) {
                    console.error('Query error:', err.message, 'SQL:', sql);
                    reject(err);
                } else {
                    resolve({ rows: rows || [] });
                }
            });
        });
    }
};

// Execute changes
export const run = async (sql: string, params: unknown[] = []) => {
    if (isPostgres) {
        const client = await getPgClient();
        try {
            let paramIndex = 1;
            const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
            
            const result = await client.query(pgSql, params);
            return { lastID: result.rows?.[0]?.id, changes: result.rowCount };
        } catch (err) {
            console.error('Run error:', err, 'SQL:', sql);
            throw err;
        }
    } else {
        return new Promise<any>((resolve, reject) => {
            db.run(sql, params, function(err: any) {
                if (err) {
                    console.error('Run error:', err.message, 'SQL:', sql);
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }
};

export { db };
