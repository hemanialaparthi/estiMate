import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Estimate() {
    const { isPremium } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_URL || '';
    const [form, setForm] = useState({
        projectType: 'feature',
        estimatedLOC: '',
        deadline: '',
        teamSize: '3'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [creatingBoard, setCreatingBoard] = useState(false);
    const [result, setResult] = useState<any>(null);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.estimatedLOC) {
            newErrors.estimatedLOC = 'LOC is required';
        } else if (Number(form.estimatedLOC) <= 0) {
            newErrors.estimatedLOC = 'LOC must be greater than 0';
        } else if (Number(form.estimatedLOC) > 500000) {
            newErrors.estimatedLOC = 'LOC seems unreasonably high';
        }

        if (!form.teamSize) {
            newErrors.teamSize = 'Team size is required';
        } else if (Number(form.teamSize) < 1 || Number(form.teamSize) > 50) {
            newErrors.teamSize = 'Team size must be between 1 and 50';
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            addToast({
                type: 'error',
                title: 'Form Error',
                message: 'Please fix the errors in the form',
                duration: 3000,
            });
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const res = await axios.post(`${apiURL}/api/estimate`, {
                ...form,
                estimatedLOC: Number(form.estimatedLOC),
                teamSize: Number(form.teamSize),
            });
            setResult(res.data);
            addToast({
                type: 'success',
                title: 'Estimate calculated',
                message: `Project will take approximately ${res.data.estimatedDays} days`,
                duration: 2000,
            });
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Estimation failed';
            addToast({
                type: 'error',
                title: 'Estimation Error',
                message: message,
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTaskBoard = async () => {
        if (!result) return;

        setCreatingBoard(true);
        try {
            const projectName = `${form.projectType} estimate (${new Date().toLocaleDateString()})`;
            const response = await axios.post('/api/projects/add-manual', {
                projectName,
                projectType: form.projectType,
                estimatedLOC: Number(form.estimatedLOC),
                actualDays: Number(result.estimatedDays),
                actualPeople: Number(form.teamSize),
            });

            navigate('/taskboard', {
                state: {
                    autoGenerate: true,
                    projectId: response.data.projectId,
                },
            });
        } catch (err: any) {
            addToast({
                type: 'error',
                title: 'Task board generation failed',
                message: err.response?.data?.message || err.response?.data?.error || 'Could not create project for task board',
                duration: 3000,
            });
        } finally {
            setCreatingBoard(false);
        }
    };

    return (
        <div className="fade-in page-shell">
            <div className="page-header">
                <h2>Run Estimation Engine</h2>
                <p>Get data-driven estimates for your next project.</p>
            </div>

            <div className="grid-2">
                {/* Form */}
                <div>
                    <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="form-label">Project Type</label>
                            <select 
                                className="form-select" 
                                value={form.projectType} 
                                onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                            >
                                <option value="feature">Feature Development</option>
                                <option value="refactor">Refactor / Technical Debt</option>
                                <option value="infrastructure">Infrastructure / DevOps</option>
                                <option value="research">Research / Spike</option>
                                <option value="bugfix">Extended Bugfix / Patch</option>
                            </select>
                            <p className="form-helper">Choose the type of work you're estimating</p>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estimated LOC (Size) *</label>
                            <input 
                                className={`form-input ${errors.estimatedLOC ? 'error' : ''}`}
                                type="number" 
                                placeholder="e.g., 2500" 
                                value={form.estimatedLOC} 
                                onChange={(e) => {
                                    setForm({ ...form, estimatedLOC: e.target.value });
                                    if (errors.estimatedLOC) setErrors({ ...errors, estimatedLOC: '' });
                                }}
                                required 
                                aria-invalid={!!errors.estimatedLOC}
                                aria-describedby={errors.estimatedLOC ? 'estimatedLOC-error' : 'estimatedLOC-helper'}
                            />
                            {errors.estimatedLOC ? (
                                <div className="form-error" id="estimatedLOC-error">
                                    <span>⚠</span> {errors.estimatedLOC}
                                </div>
                            ) : (
                                <p className="form-helper" id="estimatedLOC-helper">
                                    Total lines of code for the project
                                </p>
                            )}
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Launch Deadline (Optional)</label>
                                <input 
                                    className="form-input" 
                                    type="date" 
                                    value={form.deadline} 
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })} 
                                />
                                <p className="form-helper">Leave blank for immediate estimate</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Team Size *</label>
                                <input 
                                    className={`form-input ${errors.teamSize ? 'error' : ''}`}
                                    type="number" 
                                    value={form.teamSize} 
                                    onChange={(e) => {
                                        setForm({ ...form, teamSize: e.target.value });
                                        if (errors.teamSize) setErrors({ ...errors, teamSize: '' });
                                    }}
                                    min="1"
                                    max="50"
                                    required
                                    aria-invalid={!!errors.teamSize}
                                    aria-describedby={errors.teamSize ? 'teamSize-error' : 'teamSize-helper'}
                                />
                                {errors.teamSize ? (
                                    <div className="form-error" id="teamSize-error">
                                        <span>⚠</span> {errors.teamSize}
                                    </div>
                                ) : (
                                    <p className="form-helper" id="teamSize-helper">
                                        Number of developers
                                    </p>
                                )}
                            </div>
                        </div>

                        <button 
                            className={`btn btn-primary btn-lg ${loading ? 'loading' : ''}`} 
                            disabled={loading || !form.estimatedLOC || !form.teamSize}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" /> Calculating...
                                </>
                            ) : (
                                'Calculate Estimate →'
                            )}
                        </button>
                    </form>

                    {!isPremium && (
                        <div className="card" style={{ marginTop: 20, background: 'rgba(124,58,237,0.05)', borderColor: 'rgba(124,58,237,0.2)' }}>
                            <h4 style={{ fontSize: '0.85rem', marginBottom: 8, color: 'var(--purple-400)' }}>✦ UPGRADE TO PREMIUM</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                You are currently using <strong>Baseline Estimates</strong>. Premium users get access to 1,847+ crowd projects from the community for higher confidence.
                            </p>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div>
                    {!result && !loading && (
                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', borderStyle: 'dashed' }}>
                            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>◎</div>
                            <p>Enter project details to see estimates here.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="spinner" style={{ width: 40, height: 40 }} />
                            <p style={{ marginTop: 16 }}>Crunching historical data...</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Primary Result */}
                            <div className={`card ${isPremium ? 'card-glow' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: isPremium ? 'var(--gradient-purple)' : 'var(--border)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                                            {isPremium ? '✦ Premium Estimate' : 'Baseline Estimate'}
                                        </h3>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                                            {result.estimatedDays} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>days</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>CONFIDENCE</div>
                                        <div style={{
                                            fontSize: '1.25rem', fontWeight: 800,
                                            color: result.confidence > 70 ? 'var(--success)' : result.confidence > 40 ? 'var(--warning)' : 'var(--danger)'
                                        }}>
                                            {result.confidence}%
                                        </div>
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="stat-label">Est. People</div>
                                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{result.estimatedPeople}</div>
                                    </div>
                                    <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="stat-label">Similar Projects</div>
                                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                                            {isPremium ? result.crowdCount + (result.userProjectCount || 0) : result.userProjectCount || 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Deadline Math */}
                                {result.peopleForDeadline && (
                                    <div className={`alert ${result.deadlineFeasible ? 'alert-success' : 'alert-error'}`} style={{ marginTop: 24, flexDirection: 'column', gap: 6 }}>
                                        <div style={{ fontWeight: 600 }}>Deadline Calculation:</div>
                                        <div>
                                            To hit your deadline ({form.deadline}) in {result.daysAvailable} days, you will need <strong>{result.peopleForDeadline} people</strong>.
                                            {result.deadlineFeasible
                                                ? ` This is well within your team size of ${form.teamSize}.`
                                                : ` This exceeds your team size of ${form.teamSize}. Consider adding resources or reducing scope.`
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Task Assignment / Project Planning (Available to all) */}
                                <div className="card" style={{ marginTop: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                                    <h4 style={{ fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-primary)' }}>Project Planning &amp; Task Assignment</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        Based on previous estimates, split this project into actionable tasks. Assign work evenly among your {result.peopleForDeadline || form.teamSize} team members to ensure the {result.estimatedDays} days timeline is met.
                                    </p>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        style={{ marginTop: 12 }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleGenerateTaskBoard();
                                        }}
                                        disabled={creatingBoard}
                                    >
                                        {creatingBoard ? 'Creating Task Board...' : 'Generate Task Board'}
                                    </button>
                                </div>

                                {/* Dynamic ISO900 compliance (Premium only) */}
                                {isPremium && (
                                    <div className="card" style={{ marginTop: 16, background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }}>
                                        <h4 style={{ fontSize: '0.85rem', marginBottom: 8, color: 'var(--warning)' }}>✦ Dynamic ISO900 Compliance</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                            Automatically generating required ISO900-compliant documentation templates dynamically based on this {form.projectType} project parameters.
                                        </p>
                                        <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={(e) => { e.preventDefault(); alert('Demo: Download ISO900 Docs'); }}>Export Compliance Docs</button>
                                    </div>
                                )}
                            </div>

                            {/* Data Sources */}
                            <div className="card">
                                <h4 style={{ fontSize: '0.85rem', marginBottom: 16 }}>DATA SOURCES ANALYZED</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem' }}>Your History</span>
                                        <span className="badge badge-purple">{result.userProjectCount || 0} projects</span>
                                    </div>
                                    {isPremium && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem' }}>✦ Community Crowd Data</span>
                                            <span className="badge badge-gold">{result.crowdCount || 0} projects</span>
                                        </div>
                                    )}
                                </div>

                                <div className="divider" />

                                <h4 style={{ fontSize: '0.85rem', marginBottom: 12 }}>SIMILAR REFERENCE PROJECTS</h4>
                                {((isPremium ? result.crowdSamples : [])?.concat(result.userProjects || []))?.slice(0, 3).map((p: any, i: number) => (
                                    <div key={i} style={{ padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{p.name}</div>
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            {p.loc.toLocaleString()} LOC · {p.days} days · {p.people} people
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
