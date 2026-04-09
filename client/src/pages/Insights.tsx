import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Insights() {
    const { isPremium } = useAuth();
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_URL || '';
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isPremium) {
            axios.get(`${apiURL}/api/insights`)
                .then(res => setData(res.data))
                .catch(() => { })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isPremium]);

    if (!isPremium) {
        return (
            <div className="fade-in page-shell" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: 60, marginBottom: 20 }}>🔒</div>
                <h2 style={{ marginBottom: 12 }}>Insights is a Premium Feature</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 450, marginBottom: 32 }}>
                    Get advanced analytics, team velocity benchmarking against 1,800+ community projects, and trend visualization.
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/settings')}>
                    Upgrade to Premium →
                </button>
            </div>
        );
    }

    if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" /></div>;

    return (
        <div className="fade-in page-shell">
            <div className="page-header">
                <h2>Advanced Insights</h2>
                <p>Benchmark your team's performance against industry averages.</p>
            </div>

            {/* Benchmark alert */}
            {data?.velocityBenchmark && (
                <div className="alert alert-premium" style={{ marginBottom: 32, padding: 24, alignItems: 'center', gap: 20 }}>
                    <div style={{ fontSize: 32 }}>{data.velocityBenchmark.ratio > 1 ? '⚡' : '📈'}</div>
                    <div>
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Velocity Benchmark</h4>
                        <p>{data.velocityBenchmark.message}. This is calculated by comparing your project durations vs crowd project durations for similar LOC ranges.</p>
                    </div>
                </div>
            )}

            <div className="grid-2" style={{ marginBottom: 32 }}>
                {/* Scatter Chart */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: 24 }}>Project Duration vs. Size (LOC)</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="loc" name="LOC" stroke="var(--text-muted)" fontSize={12} unit=" loc" />
                                <YAxis type="number" dataKey="actual_days" name="Days" stroke="var(--text-muted)" fontSize={12} unit="d" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                                />
                                <Scatter name="Projects" data={data?.scatter} fill="var(--purple-500)" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Avg by Type */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: 24 }}>Avg. Days by Project Type</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.avgByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="project_type" stroke="var(--text-muted)" fontSize={10} tickFormatter={(val) => val.toUpperCase()} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} unit="d" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                                />
                                <Bar dataKey="avg_days" radius={[4, 4, 0, 0]}>
                                    {data?.avgByType?.map((_entry: any, index: number) => (
                                        <Cell key={index} fill={['#8b5cf6', '#6366f1', '#a78bfa', '#818cf8', '#4f46e5'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-label">Your Avg. People</div>
                    <div className="stat-value">{data?.userStats.avg_people}</div>
                    <div className="stat-sub">per project</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Crowd Avg. People</div>
                    <div className="stat-value">{data?.crowdStats.avg_people}</div>
                    <div className="stat-sub">community average</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Anomalies Detected</div>
                    <div className="stat-value">0</div>
                    <div className="stat-sub">velocity is stable</div>
                </div>
            </div>
        </div>
    );
}
