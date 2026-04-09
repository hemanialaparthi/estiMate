import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { SkeletonStats } from '../components/LoadingStates';

interface Stats {
    total: number;
    limit: number;
}

interface HistoryItem {
    id: number;
    request_data: { projectType: string; estimatedLOC: number };
    result: { estimatedDays: number; estimatedPeople: number; confidence: number };
    created_at: string;
}

export default function Dashboard() {
    const { user, isPremium } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_URL || 'https://estimate-api-vgw1.onrender.com';
    const [stats, setStats] = useState<Stats | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectsRes, historyRes] = await Promise.all([
                    axios.get(`${apiURL}/api/projects`).catch(() => ({ data: { total: 0, limit: 10 } })),
                    axios.get(`${apiURL}/api/estimate/history`).catch(() => ({ data: [] })),
                ]);
                
                setStats({ 
                    total: projectsRes.data?.total ?? 0, 
                    limit: projectsRes.data?.limit ?? 10 
                });
                setHistory(historyRes.data || []);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
                addToast({
                    type: 'error',
                    title: 'Failed to load dashboard',
                    message: 'Please try refreshing the page',
                    duration: 3000,
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [addToast]);

    const avgConfidence = history.length > 0
        ? Math.round(history.reduce((s, h) => s + (h.result.confidence ?? 0), 0) / history.length)
        : 0;

    return (
        <div className="fade-in page-shell">
            <div className="page-header">
                <h2>Welcome back, <span className="gradient-text">{user?.email.split('@')[0]}</span></h2>
                <p>Your project estimation dashboard</p>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 28 }}>
                {loading ? (
                    <SkeletonStats />
                ) : (
                    <>
                        <div className="stat-card">
                            <div className="stat-label">Your Projects</div>
                            <div className="stat-value">{stats?.total ?? 0}</div>
                            {!isPremium && <div className="stat-sub">of {stats?.limit ?? 10} free limit</div>}
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Estimations Run</div>
                            <div className="stat-value">{history.length}</div>
                            <div className="stat-sub">in your history</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Avg Confidence</div>
                            <div className="stat-value">
                                {history.length > 0 ? `${avgConfidence}%` : 'N/A'}
                            </div>
                            <div className="stat-sub">across all estimates</div>
                        </div>
                        <div className="stat-card" style={{ borderColor: isPremium ? 'rgba(251,191,36,0.3)' : undefined }}>
                            <div className="stat-label">Crowd Projects</div>
                            <div className="stat-value" style={{ color: isPremium ? 'var(--warning)' : 'var(--text-muted)', fontSize: '1.5rem' }}>
                                {isPremium ? '1,847' : '—'}
                            </div>
                            <div className="stat-sub">{isPremium ? 'community projects' : 'Upgrade to access'}</div>
                        </div>
                    </>
                )}
            </div>

            {/* Premium upsell */}
            {!isPremium && !loading && (
                <div className="alert alert-premium" style={{ marginBottom: 28, justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✦ Upgrade to Premium to access 1,847+ real-world crowd projects and get significantly more accurate estimates.</span>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 16, flexShrink: 0 }} onClick={() => navigate('/settings')}>
                        Upgrade →
                    </button>
                </div>
            )}

            {/* Quick actions */}
            <div className="grid-2" style={{ marginBottom: 32 }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>◈ Add project data</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        Connect GitHub repos, upload CSVs, or manually enter past projects to improve estimates.
                    </p>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/projects')}>
                        Add data source →
                    </button>
                </div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ fontSize: '1rem' }}>◎ Run an estimation</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        Describe your next project and get a data-driven estimate in seconds.
                    </p>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/estimate')}>
                        Estimate now →
                    </button>
                </div>
            </div>

            {/* Recent estimations */}
            <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Recent Estimations</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                        <span className="spinner" />
                    </div>
                ) : history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No estimations yet.{' '}
                        <button onClick={() => navigate('/estimate')} style={{ background: 'none', border: 'none', color: 'var(--purple-400)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.9rem' }}>
                            Run your first one →
                        </button>
                    </div>
                ) : (
                    <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>LOC</th>
                                <th>Est. Days</th>
                                <th>Est. People</th>
                                <th>Confidence</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h) => (
                                <tr key={h.id}>
                                    <td><span className="badge badge-purple">{h.request_data.projectType}</span></td>
                                    <td>{h.request_data.estimatedLOC?.toLocaleString()}</td>
                                    <td>{h.result.estimatedDays} days</td>
                                    <td>{h.result.estimatedPeople} people</td>
                                    <td>
                                        <span style={{ color: h.result.confidence > 60 ? 'var(--success)' : h.result.confidence > 30 ? 'var(--warning)' : 'var(--danger)' }}>
                                            {h.result.confidence}%
                                        </span>
                                    </td>
                                    <td>{new Date(h.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
        </div>
    );
}
