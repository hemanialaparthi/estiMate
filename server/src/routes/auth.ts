import { Router, Request, Response } from 'express';
import { query, run } from '../db/index.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
// @ts-ignore
import crypto from 'crypto';

const router = Router();

function hashPassword(password: string): string {
    return crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, hash: string): boolean {
    const newHash = crypto.pbkdf2Sync(password, 'salt', 1000, 64, 'sha512').toString('hex');
    return newHash === hash;
}

// POST /api/auth/register - Create new user
router.post('/register', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'Email and password are required',
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            error: 'WEAK_PASSWORD',
            message: 'Password must be at least 6 characters',
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'INVALID_EMAIL',
            message: 'Invalid email format',
        });
    }

    try {
        // Check if user exists
        const existingResult: any = await query('SELECT id FROM users WHERE email = ?', [email]);
        const existingUsers = (existingResult && existingResult.rows) ? existingResult.rows : existingResult || [];
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return res.status(409).json({
                error: 'USER_EXISTS',
                message: 'User already registered with this email',
            });
        }

        // Hash password
        const passwordHash = hashPassword(password);

        // Create user
        const result = await run(
            'INSERT INTO users (email, password_hash, subscription_tier) VALUES (?, ?, ?)',
            [email, passwordHash, 'free']
        );

        const userId = result.lastID as number;

        // Generate token
        const token = generateToken(userId, email);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: userId,
                email,
                tier: 'free',
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'REGISTRATION_ERROR',
            message: 'Failed to create account',
        });
    }
});

// POST /api/auth/login - Authenticate user
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'Email and password are required',
        });
    }

    try {
        // Find user
        const result: any = await query('SELECT id, email, password_hash, subscription_tier FROM users WHERE email = ?', [email]);
        const users = Array.isArray(result?.rows) ? result.rows : [];

        if (!users || users.length === 0) {
            return res.status(401).json({
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            });
        }

        const user = users[0];

        // Verify password
        if (!verifyPassword(password, user.password_hash)) {
            return res.status(401).json({
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            });
        }

        // Generate token
        const token = generateToken(user.id, user.email);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                tier: user.subscription_tier,
            },
        });
    } catch (error: any) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            error: 'LOGIN_ERROR',
            message: error.message || 'Failed to authenticate',
        });
    }
});

// GET /api/auth/verify - Verify token
router.get('/verify', verifyToken, async (req: Request, res: Response) => {
    try {
        const result: any = await query('SELECT id, email, subscription_tier FROM users WHERE id = ?', [(req as any).userId]);
        const users = (result && result.rows) ? result.rows : (result || []);

        if (users.length === 0) {
            return res.status(404).json({
                error: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }

        const user = users[0];
        res.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                tier: user.subscription_tier,
            },
        });
    } catch (error: any) {
        console.error('Verify error:', error);
        res.status(500).json({
            error: 'VERIFY_ERROR',
            message: 'Failed to verify token',
        });
    }
});

export default router;
