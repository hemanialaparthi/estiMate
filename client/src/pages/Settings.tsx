import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user, logout, isPremium, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const toggleSubscription = async () => {
        setLoading(true);
        const newTier = isPremium ? 'free' : 'premium';
        try {
            const res = await axios.patch('/api/settings/subscription', { tier: newTier });
            // Update local storage and context
            localStorage.setItem('em_token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            await refreshUser();
            setMessage({ text: `Successfully ${isPremium ? 'downgraded to Free' : 'upgraded to Premium'}!`, type: 'success' });
        } catch (_) {
            setMessage({ text: 'Failed to update subscription.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await axios.get('/api/settings/export');
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `estimate-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        } catch (_) {
            alert('Export failed');
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: 800 }}>
            <div className="page-header">
                <h2>Account Settings</h2>
                <p>Manage your subscription and data preferences.</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: 24 }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {/* Subscription Card */}
                <div className="card" style={{ borderLeft: `4px solid ${isPremium ? 'var(--warning)' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <div>
                            <h3 style={{ marginBottom: 4 }}>Your Subscription</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Currently on the <strong>{isPremium ? 'Premium' : 'Free'}</strong> plan.
                            </p>
                        </div>
                        <span className={`badge ${isPremium ? 'badge-gold' : 'badge-purple'}`}>
                            {isPremium ? '✦ Premium' : 'Free Tier'}
                        </span>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
                            <li style={{ display: 'flex', gap: 10 }}>
                                <span style={{ color: 'var(--success)' }}>✓</span>
                                {isPremium ? 'Unlimited project data' : 'Up to 10 projects'}
                            </li>
                            <li style={{ display: 'flex', gap: 10 }}>
                                <span style={{ color: 'var(--success)' }}>✓</span>
                                {isPremium ? 'Access to crowd estimation data' : 'Baseline estimation only'}
                            </li>
                            <li style={{ display: 'flex', gap: 10 }}>
                                <span style={{ color: 'var(--success)' }}>✓</span>
                                Project planning & task assignment (based on past estimates)
                            </li>
                            <li style={{ display: 'flex', gap: 10 }}>
                                <span style={{ color: isPremium ? 'var(--success)' : 'var(--text-muted)' }}>
                                    {isPremium ? '✓' : '○'}
                                </span>
                                Advanced insights & benchmarking
                            </li>
                            <li style={{ display: 'flex', gap: 10 }}>
                                <span style={{ color: isPremium ? 'var(--success)' : 'var(--text-muted)' }}>
                                    {isPremium ? '✓' : '○'}
                                </span>
                                Dynamic ISO900 compliance
                            </li>
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className={`btn ${isPremium ? 'btn-outline' : 'btn-primary'}`} onClick={toggleSubscription} disabled={loading}>
                            {loading ? 'Processing...' : isPremium ? 'Cancel Premium (Demo)' : 'Upgrade to Premium →'}
                        </button>
                        {!isPremium && <span style={{ padding: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>$12/month · Save 30% annually</span>}
                    </div>
                </div>

                {/* Data Management */}
                <div className="card">
                    <h3 style={{ marginBottom: 16 }}>Data &amp; Privacy</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Anonymized Data Contribution</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                    Share your project metadata with the community to help everyone get better estimates.
                                </div>
                            </div>
                            <div className="toggle on" />
                        </div>

                        <div className="divider" style={{ margin: '0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Export Your Data</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                    Download all your projects and estimation history as a JSON file.
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={handleExport}>Download JSON</button>
                        </div>
                    </div>
                </div>

                {/* Account */}
                <div className="card">
                    <h3 style={{ marginBottom: 16, color: 'var(--danger)' }}>Danger Zone</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                        Deleting your account will permanently remove all your data. This action cannot be undone.
                    </p>
                    <button className="btn btn-danger btn-sm" onClick={() => alert('Demo only')}>Delete Account</button>
                </div>
            </div>
        </div>
    );
}
