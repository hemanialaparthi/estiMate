import { Router, Request, Response } from 'express';
import axios from 'axios';
import { analyzeGitHubRepo, EstimationResult } from '../services/github-service.js';

const router = Router();

interface AnalyzeRequest {
    url: string;
    features: Array<{ name: string; lines: number }>;
    teamSize: number;
}

// POST /api/analyze - Main GitHub analysis endpoint
router.post('/', async (req: Request, res: Response) => {
    const { url, features, teamSize } = req.body as AnalyzeRequest;

    // Validation
    if (!url || typeof url !== 'string') {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'GitHub repository URL is required'
        });
    }

    if (!features || !Array.isArray(features) || features.length === 0) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'At least one feature must be selected'
        });
    }

    if (!teamSize || teamSize < 1) {
        return res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'Team size must be at least 1'
        });
    }

    try {
        const result = await analyzeGitHubRepo(url, features, teamSize);
        res.json(result);
    } catch (error: any) {
        console.error('Analysis error:', error.message);

        if (error.message.includes('INVALID_URL')) {
            return res.status(400).json({
                error: 'INVALID_REPO',
                message: 'Invalid GitHub URL format. Use: https://github.com/owner/repo'
            });
        }

        if (error.message.includes('NOT_FOUND')) {
            return res.status(404).json({
                error: 'REPO_NOT_FOUND',
                message: 'Repository not found. Make sure it exists and is public.'
            });
        }

        if (error.message.includes('RATE_LIMITED')) {
            return res.status(429).json({
                error: 'RATE_LIMITED',
                message: 'GitHub API rate limit exceeded',
                retryAfter: error.retryAfter || 3600
            });
        }

        if (error.message.includes('NO_DATA')) {
            return res.status(422).json({
                error: 'INSUFFICIENT_DATA',
                message: 'Repository has fewer than 5 closed PRs. Need more history for analysis.'
            });
        }

        res.status(500).json({
            error: 'ANALYSIS_ERROR',
            message: error.message || 'Failed to analyze repository'
        });
    }
});

export default router;
