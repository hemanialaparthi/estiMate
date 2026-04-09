import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Project {
    id: number;
    name: string;
    source: string;
    project_type: string;
    loc: number;
    actual_days: number;
    actual_people: number;
    is_shared: boolean;
    created_at: string;
}

export default function Projects() {
    const { isPremium } = useAuth();
    const apiURL = 'https://estimate-api-vgw1.onrender.com';
    const [tab, setTab] = useState<'github' | 'csv' | 'manual'>('github');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, limit: 10 });

    // Form states
    const [repoUrl, setRepoUrl] = useState('');
    const [manual, setManual] = useState({ name: '', type: 'feature', loc: '', days: '', people: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${apiURL}/api/projects`);
            setProjects(res.data.projects);
            setStats({ total: res.data.total, limit: res.data.limit });
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            if (err instanceof Error) {
                setError(`Failed to load projects: ${err.message}`);
            } else {
                setError('Failed to load projects');
            }
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(''); setSuccess('');
        try {
            await axios.post(`${apiURL}/api/projects/add-manual`, {
                projectName: manual.name,
                projectType: manual.type,
                estimatedLOC: Number(manual.loc),
                actualDays: Number(manual.days),
                actualPeople: Number(manual.people),
            });
            setSuccess('Project added successfully');
            setManual({ name: '', type: 'feature', loc: '', days: '', people: '' });
            fetchProjects();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add project');
        } finally { setSubmitting(false); }
    };

    const handleGithubSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(''); setSuccess('');
        try {
            const res = await axios.post(`${apiURL}/api/projects/add-github`, { repoUrl });
            setSuccess(`Successfully imported ${res.data.inserted} projects from ${res.data.repo}`);
            setRepoUrl('');
            fetchProjects();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to scrape repository');
        } finally { setSubmitting(false); }
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSubmitting(true);
        setError(''); setSuccess('');
        try {
            const csvData = await file.text();
            const res = await axios.post(`${apiURL}/api/projects/upload-csv`, { csvData });
            setSuccess(`Imported ${res.data.inserted} projects (${res.data.skipped} skipped)`);
            fetchProjects();
        } catch (err: any) {
            setError(err.response?.data?.error || 'CSV upload failed');
        } finally {
            setSubmitting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await axios.delete(`${apiURL}/api/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
            setStats(prev => ({ ...prev, total: prev.total - 1 }));
            setSuccess('Project deleted successfully');
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Delete failed - please try again');
        }
    };

    const toggleShare = async (id: number, current: boolean) => {
        try {
            await axios.patch(`${apiURL}/api/projects/${id}/share`, { isShared: !current });
            setProjects(projects.map(p => p.id === id ? { ...p, is_shared: !current } : p));
        } catch (err) {
            console.error('Share toggle failed:', err);
            alert('Update failed - please try again');
        }
    };

    return (
        <div className="fade-in page-shell">
            <div className="page-header">
                <h2>Manage Project Data</h2>
                <p>Add historical data to improve your estimation accuracy.</p>
            </div>

            {!isPremium && stats.total >= stats.limit && (
                <div className="alert alert-warning" style={{ marginBottom: 24 }}>
                    <span>You've reached the free limit of {stats.limit} projects. Upgrade to Premium for unlimited storage.</span>
                </div>
            )}

            {/* Tabs */}
            <div className="card" style={{ marginBottom: 32 }}>
                <div className="tabs">
                    <button className={`tab-btn ${tab === 'github' ? 'active' : ''}`} onClick={() => setTab('github')}>GitHub Import</button>
                    <button className={`tab-btn ${tab === 'csv' ? 'active' : ''}`} onClick={() => setTab('csv')}>CSV Upload</button>
                    <button className={`tab-btn ${tab === 'manual' ? 'active' : ''}`} onClick={() => setTab('manual')}>Manual Entry</button>
                </div>

                <div style={{ minHeight: 180 }}>
                    {tab === 'github' && (
                        <form onSubmit={handleGithubSubmit} style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Enter a public GitHub repository URL. We'll analyze merged PRs to extract project sizes and durations.
                            </p>
                            <div className="form-group">
                                <input
                                    className="form-input"
                                    placeholder="https://github.com/owner/repo"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    disabled={submitting}
                                    required
                                />
                            </div>
                            <button className="btn btn-primary btn-sm" style={{ width: 'fit-content' }} disabled={submitting}>
                                {submitting ? 'Analyzing PRs...' : 'Import Repository'}
                            </button>
                        </form>
                    )}

                    {tab === 'csv' && (
                        <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Upload a CSV file with these headers: <code>name, project_type, loc, actual_days, actual_people</code>.
                            </p>
                            <div
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--purple-500)'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                {submitting ? <span className="spinner" /> : <div style={{ fontSize: 24, marginBottom: 8 }}>☁</div>}
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{submitting ? 'Parsing CSV...' : 'Click to select CSV file'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>or drag and drop here</div>
                                <input type="file" ref={fileInputRef} hidden accept=".csv" onChange={handleCsvUpload} disabled={submitting} />
                            </div>
                        </div>
                    )}

                    {tab === 'manual' && (
                        <form onSubmit={handleManualSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Project Name</label>
                                <input className="form-input" value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} placeholder="e.g. Dashboard Redesign" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select className="form-select" value={manual.type} onChange={(e) => setManual({ ...manual, type: e.target.value })} aria-label="Project type">
                                    <option value="feature">Feature</option>
                                    <option value="refactor">Refactor</option>
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="research">Research</option>
                                    <option value="bugfix">Bugfix</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">LOC (Size)</label>
                                <input className="form-input" type="number" value={manual.loc} onChange={(e) => setManual({ ...manual, loc: e.target.value })} placeholder="Lines of Code" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Actual Days</label>
                                <input className="form-input" type="number" value={manual.days} onChange={(e) => setManual({ ...manual, days: e.target.value })} placeholder="Duration in days" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Actual People</label>
                                <input className="form-input" type="number" value={manual.people} onChange={(e) => setManual({ ...manual, people: e.target.value })} placeholder="Team size" required />
                            </div>
                            <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
                                <button className="btn btn-primary btn-sm" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Add Project'}
                                </button>
                            </div>
                        </form>
                    )}

                    {error && <div className="alert alert-error" style={{ marginTop: 20 }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ marginTop: 20 }}>{success}</div>}
                </div>
            </div>

            {/* Projects Table */}
            <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    Your Projects
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats.total} total</span>
                </h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
                ) : projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No projects added yet.</div>
                ) : (
                    <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Source</th>
                                <th>Type</th>
                                <th>LOC</th>
                                <th>Days</th>
                                <th>People</th>
                                <th>Shared</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{p.source.toUpperCase()}</span></td>
                                    <td><span className="badge badge-purple">{p.project_type}</span></td>
                                    <td>{p.loc.toLocaleString()}</td>
                                    <td>{p.actual_days}</td>
                                    <td>{p.actual_people}</td>
                                    <td>
                                        <div className={`toggle ${p.is_shared ? 'on' : ''}`} onClick={() => toggleShare(p.id, p.is_shared)} />
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)} style={{ padding: 4 }}>
                                            <span style={{ fontSize: 14 }}>🗑</span>
                                        </button>
                                    </td>
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
