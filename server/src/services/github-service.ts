import axios from 'axios';

export interface EstimationResult {
    repo_url: string;
    estimated_days: number;
    avg_cycle_time_days: number;
    lines_per_day: number;
    number_of_prs: number;
    confidence: string;
    velocity_summary: string;
}

interface PullRequest {
    created_at: string;
    merged_at: string | null;
    additions: number;
    deletions: number;
}

interface Feature {
    name: string;
    lines: number;
}

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Parse GitHub URL to extract owner and repo
 */
function parseGitHubURL(url: string): { owner: string; repo: string } {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        if (hostname !== 'github.com') {
            throw new Error('Not a GitHub URL');
        }

        const parts = urlObj.pathname.split('/').filter(p => p);
        if (parts.length < 2) {
            throw new Error('Invalid GitHub URL format');
        }

        const owner = parts[0];
        const repo = parts[1].replace('.git', '');

        if (!owner || !repo) {
            throw new Error('Could not extract owner/repo');
        }

        return { owner, repo };
    } catch (error) {
        throw new Error(`INVALID_URL: ${error instanceof Error ? error.message : 'Invalid URL'}`);
    }
}

/**
 * Fetch closed PRs from GitHub with rate limit handling
 */
async function fetchClosedPRs(owner: string, repo: string): Promise<PullRequest[]> {
    try {
        const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
        };

        if (GITHUB_TOKEN) {
            headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        }

        console.log(`📥 Fetching PRs for ${owner}/${repo}...`);

        const response = await axios.get(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=closed&per_page=100&sort=updated&direction=desc`,
            { headers, timeout: 10000 }
        );

        // Check rate limit headers
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];

        if (remaining && parseInt(remaining) < 10) {
            const resetTime = new Date(parseInt(reset) * 1000);
            const waitSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
            throw new Error(`RATE_LIMITED|${waitSeconds}`);
        }

        const prs = response.data.filter((pr: any) => pr.merged_at).map((pr: any) => ({
            created_at: pr.created_at,
            merged_at: pr.merged_at,
            additions: pr.additions || 0,
            deletions: pr.deletions || 0,
        }));

        console.log(`✅ Found ${prs.length} merged PRs`);

        if (prs.length < 5) {
            throw new Error('NO_DATA: Insufficient PR history (need at least 5 merged PRs)');
        }

        return prs;
    } catch (error: any) {
        if (error.message.includes('RATE_LIMITED')) {
            throw error;
        }

        if (error.response?.status === 404) {
            throw new Error('NOT_FOUND: Repository not found or is private');
        }

        if (error.response?.status === 403) {
            const resetTime = error.response.headers['x-ratelimit-reset'];
            const waitSeconds = resetTime ? Math.ceil((parseInt(resetTime) * 1000 - Date.now()) / 1000) : 3600;
            throw new Error(`RATE_LIMITED|${waitSeconds}`);
        }

        throw error;
    }
}

/**
 * Calculate velocity from PR history
 */
function calculateVelocity(prs: PullRequest[]): {
    avg_cycle_time_days: number;
    lines_per_day: number;
    total_lines_changed: number;
} {
    let totalCycleTime = 0;
    let totalLines = 0;

    for (const pr of prs) {
        const createdAt = new Date(pr.created_at).getTime();
        const mergedAt = new Date(pr.merged_at || Date.now()).getTime();
        const cycleTimeMs = mergedAt - createdAt;
        const cycleTimeDays = cycleTimeMs / (1000 * 60 * 60 * 24);

        // Only count PRs with reasonable cycle times (0.1 to 365 days)
        if (cycleTimeDays >= 0.1 && cycleTimeDays <= 365) {
            totalCycleTime += cycleTimeDays;
            totalLines += pr.additions + pr.deletions;
        }
    }

    const validPRCount = Math.min(prs.length, 50); // Use up to 50 PRs for calculation
    const avg_cycle_time_days = validPRCount > 0 ? totalCycleTime / validPRCount : 1;
    const lines_per_day = totalLines > 0 && avg_cycle_time_days > 0 ? totalLines / (avg_cycle_time_days * validPRCount) : 100;

    return {
        avg_cycle_time_days: Math.max(0.5, avg_cycle_time_days), // Minimum 0.5 days
        lines_per_day: Math.max(10, lines_per_day), // Minimum 10 lines/day
        total_lines_changed: totalLines,
    };
}

/**
 * Estimate project duration based on selected features
 */
function estimateProject(
    features: Feature[],
    teamSize: number,
    velocity: { avg_cycle_time_days: number; lines_per_day: number }
): { estimated_days: number; confidence: string } {
    const totalLines = features.reduce((sum, f) => sum + f.lines, 0);
    
    // Estimate = Total Lines / (Lines per day * Team Size)
    // Adjusted for team parallelization (diminishing returns)
    const teamEfficiency = 1 + Math.log10(Math.max(1, teamSize)) * 0.3; // Slight boost for larger teams
    const estimatedDays = totalLines / (velocity.lines_per_day * teamEfficiency);

    // Confidence based on consistency
    let confidence = 'Medium';
    if (estimatedDays < 5) {
        confidence = 'High'; // Short tasks are more predictable
    } else if (estimatedDays > 30) {
        confidence = 'Low'; // Long tasks have more uncertainty
    }

    return {
        estimated_days: Math.ceil(estimatedDays),
        confidence,
    };
}

/**
 * Main analysis function
 */
export async function analyzeGitHubRepo(
    url: string,
    features: Feature[],
    teamSize: number
): Promise<EstimationResult> {
    // Parse URL
    const { owner, repo } = parseGitHubURL(url);

    // Fetch PRs
    const prs = await fetchClosedPRs(owner, repo);

    // Calculate velocity
    const velocity = calculateVelocity(prs);

    // Estimate project
    const { estimated_days, confidence } = estimateProject(features, teamSize, velocity);

    // Format velocity summary
    const velocitySummary =
        `Repo averages ${velocity.avg_cycle_time_days.toFixed(1)} days per PR ` +
        `with ${velocity.lines_per_day.toFixed(0)} lines/day velocity across ${prs.length} PRs`;

    return {
        repo_url: url,
        estimated_days,
        avg_cycle_time_days: Math.round(velocity.avg_cycle_time_days * 10) / 10,
        lines_per_day: Math.round(velocity.lines_per_day),
        number_of_prs: prs.length,
        confidence,
        velocity_summary: velocitySummary,
    };
}
