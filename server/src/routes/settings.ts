import { Router, Request, Response } from 'express';
import { query, run } from '../db/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// GET /api/settings - Get user settings
router.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT id, email, subscription_tier, created_at FROM users WHERE id = ?', [req.userId]);
        const users = ((result as any)?.rows as any[] || []);

        if (users.length === 0) {
            return res.status(404).json({
                error: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }

        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            subscription_tier: user.subscription_tier,
            created_at: user.created_at,
        });
    } catch (error: any) {
        console.error('Settings fetch error:', error);
        res.status(500).json({
            error: 'SETTINGS_ERROR',
            message: 'Failed to fetch settings',
        });
    }
});

// PATCH /api/settings - Update user settings
router.patch('/', verifyToken, async (req: Request, res: Response) => {
    const { subscription_tier } = req.body;

    if (!subscription_tier || !['free', 'premium'].includes(subscription_tier)) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'subscription_tier must be "free" or "premium"',
        });
    }

    try {
        await run(
            'UPDATE users SET subscription_tier = ? WHERE id = ?',
            [subscription_tier, req.userId]
        );

        const result = await query('SELECT id, email, subscription_tier FROM users WHERE id = ?', [req.userId]);
        const users = ((result as any)?.rows as any[] || []);
        const user = users[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                tier: user.subscription_tier,
            },
        });
    } catch (error: any) {
        console.error('Settings update error:', error);
        res.status(500).json({
            error: 'SETTINGS_ERROR',
            message: 'Failed to update settings',
        });
    }
});

export default router;
