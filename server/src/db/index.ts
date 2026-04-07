import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Create data directory - use 'data' folder in server root
const dataDir = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'estimates.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
export async function initializeDatabase() {
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
                    console.error('❌ Database schema error:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

// Query data
export const query = (sql: string, params: unknown[] = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Query error:', err.message, 'SQL:', sql);
                reject(err);
            } else {
                resolve({ rows: rows || [] });
            }
        });
    });
};

// Execute changes
export const run = (sql: string, params: unknown[] = []) => {
    return new Promise<any>((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Run error:', err.message, 'SQL:', sql);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

export { db };
