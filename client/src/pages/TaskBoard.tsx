import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

interface Task {
    id: number;
    title: string;
    description?: string;
    category: string;
    status: string;
    assigned_to?: string;
    estimated_days?: number;
    depends_on?: number;
}

interface Project {
    id: number;
    name: string;
    project_type: string;
    loc: number;
}

interface Board {
    boardId: string;
    projectName: string;
    projectType: string;
    totalEstimatedDays: number;
    taskCount: number;
    tasks: Task[];
}

export default function TaskBoard() {
    // const { } = useAuth();
    const location = useLocation();
    const routeState = location.state as { autoGenerate?: boolean; projectId?: number } | null;
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [board, setBoard] = useState<Board | null>(null);
    const [generating, setGenerating] = useState(false);
    const [selecting, setSelecting] = useState('');
    const [error, setError] = useState('');
    const [teamMembers] = useState(['Developer 1', 'Developer 2', 'Designer', 'QA Engineer']);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (!routeState?.autoGenerate || !routeState?.projectId) return;
        generateBoard(routeState.projectId);
        // Trigger once when arriving from estimate page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeState?.autoGenerate, routeState?.projectId]);

    const fetchProjects = async () => {
        try {
            const res = await axios.get('/api/projects');
            setProjects(res.data.projects);
        } catch (_) {
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const generateBoard = async (projectId: number) => {
        setGenerating(true);
        setSelecting(String(projectId));
        setError('');
        try {
            const res = await axios.post('/api/tasks/generate', { projectId });
            setBoard(res.data);
            setSelecting('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate task board');
        } finally {
            setGenerating(false);
        }
    };

    const updateTaskStatus = async (taskId: number, newStatus: string, assignedTo?: string) => {
        if (!board) return;

        try {
            await axios.patch(`/api/tasks/task/${taskId}`, { status: newStatus, assignedTo });

            // Update local board
            const updatedTasks = board.tasks.map(t =>
                t.id === taskId ? { ...t, status: newStatus, assigned_to: assignedTo || t.assigned_to } : t
            );
            setBoard({ ...board, tasks: updatedTasks });
        } catch (_) {
            setError('Failed to update task');
        }
    };

    const exportCSV = async () => {
        if (!board) return;
        try {
            const res = await axios.get(`/api/tasks/export/${board.boardId}/csv`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `taskboard-${board.projectName}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (_) {
            setError('Failed to export CSV');
        }
    };

    const generateShareLink = async () => {
        if (!board) return;
        try {
            const res = await axios.post(`/api/tasks/share/${board.boardId}`);
            const shareUrl = res.data.shareUrl;
            alert(`Share this link:\n\n${shareUrl}`);
            navigator.clipboard.writeText(shareUrl);
        } catch (_) {
            setError('Failed to generate share link');
        }
    };

    const getTasksByStatus = (status: string) => {
        if (!board) return [];
        return board.tasks.filter(t => t.status === status);
    };

    const categoryColors: Record<string, string> = {
        Design: '#f59e0b',
        Backend: '#3b82f6',
        Frontend: '#8b5cf6',
        Testing: '#ec4899',
        DevOps: '#6366f1'
    };

    if (loading) {
        return <div className="page-header"><p>Loading...</p></div>;
    }

    return (
        <div className="fade-in page-shell">
            <div className="page-header">
                <h2>📋 Task Board Generator</h2>
                <p>Break down projects into actionable tasks with time estimates.</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {!board ? (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3>Create Task Board</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Select a project to generate an interactive task board:</p>

                    {projects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No projects yet. <a href="/projects">Create one first →</a></p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    style={{
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        padding: 16,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-color)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = '';
                                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                                    }}
                                >
                                    <div>
                                        <strong>{project.name}</strong>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                            {project.project_type} • {project.loc} LOC
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => generateBoard(project.id)}
                                        disabled={generating}
                                    >
                                        {generating && selecting === String(project.id) ? (
                                            <><span className="spinner" /> Generating...</>
                                        ) : (
                                            'Generate →'
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {/* Board Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                        <div>
                            <h3>{board.projectName} Task Board</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {board.taskCount} tasks • {board.totalEstimatedDays.toFixed(1)} days
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
                                📥 CSV Export
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={generateShareLink}>
                                🔗 Share Link
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setBoard(null)}>
                                ← Back
                            </button>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: 20,
                        marginBottom: 40
                    }}>
                        {['todo', 'in_progress', 'done'].map(status => {
                            const statusLabel = status === 'todo' ? '📝 To Do' : status === 'in_progress' ? '⚙️ In Progress' : '✅ Done';
                            const statusTasks = getTasksByStatus(status);

                            return (
                                <div
                                    key={status}
                                    style={{
                                        border: '1px solid var(--border)',
                                        borderRadius: 12,
                                        padding: 16,
                                        backgroundColor: 'var(--bg-secondary)',
                                        minHeight: '500px'
                                    }}
                                >
                                    <h4 style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid var(--border)' }}>
                                        {statusLabel}
                                    </h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {statusTasks.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 10px' }}>
                                                No tasks
                                            </p>
                                        ) : (
                                            statusTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    style={{
                                                        border: '1px solid var(--border)',
                                                        borderLeft: `4px solid ${categoryColors[task.category]}`,
                                                        borderRadius: 8,
                                                        padding: 12,
                                                        backgroundColor: 'var(--bg-primary)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    draggable
                                                    onDragStart={(e) => e.dataTransfer!.effectAllowed = 'move'}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                                                        <div style={{ flex: 1 }}>
                                                            <h5 style={{ marginBottom: 6 }}>{task.title}</h5>
                                                            {task.description && (
                                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                                                                <span
                                                                    style={{
                                                                        display: 'inline-block',
                                                                        backgroundColor: categoryColors[task.category],
                                                                        color: 'white',
                                                                        padding: '2px 8px',
                                                                        borderRadius: 4,
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    {task.category}
                                                                </span>
                                                                {task.estimated_days && (
                                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                        {task.estimated_days.toFixed(1)}d
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Task Controls */}
                                                    {status !== 'done' && (
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {status === 'todo' && (
                                                                <button
                                                                    className="btn btn-sm"
                                                                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                                >
                                                                    Start
                                                                </button>
                                                            )}
                                                            {status === 'in_progress' && (
                                                                <>
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                                                        onClick={() => updateTaskStatus(task.id, 'todo')}
                                                                    >
                                                                        To Do
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                                                        onClick={() => updateTaskStatus(task.id, 'done')}
                                                                    >
                                                                        Done
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Assign To */}
                                                    {!task.assigned_to && (
                                                        <select
                                                            style={{
                                                                width: '100%',
                                                                marginTop: 8,
                                                                padding: '4px',
                                                                borderRadius: 4,
                                                                border: '1px solid var(--border)',
                                                                fontSize: '0.85rem'
                                                            }}
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    updateTaskStatus(task.id, status, e.target.value);
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Assign to...</option>
                                                            {teamMembers.map(member => (
                                                                <option key={member} value={member}>{member}</option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    {task.assigned_to && (
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginTop: 8 }}>
                                                            👤 {task.assigned_to}
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Task Summary */}
                    <div className="card">
                        <h4>📊 Task Summary</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
                            {Object.entries(categoryColors).map(([category, color]) => {
                                const catTasks = board.tasks.filter(t => t.category === category);
                                const totalDays = catTasks.reduce((sum, t) => sum + (t.estimated_days || 0), 0);
                                return (
                                    <div key={category} style={{ padding: 12, backgroundColor: 'var(--bg-secondary)', borderRadius: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 4 }} />
                                            <strong>{category}</strong>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
                                            {catTasks.length} tasks
                                        </p>
                                        <p style={{ color: 'var(--primary-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {totalDays.toFixed(1)}d
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
