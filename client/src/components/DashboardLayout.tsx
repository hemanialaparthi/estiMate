import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Projects', path: '/projects', icon: '📁' },
    { label: 'Estimate', path: '/estimate', icon: '⚡' },
    { label: 'Task Board', path: '/taskboard', icon: '✓' },
    { label: 'Insights', path: '/insights', icon: '💡' },
    { label: 'Settings', path: '/settings', icon: '⚙' },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="app-shell">
            {/* Sidebar */}
            <aside className="app-sidebar">
                <div className="app-logo">estiMATE</div>

                <nav className="app-nav">
                    {menuItems.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className={`app-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(item.path);
                            }}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div style={{ padding: '0 12px 16px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                    <div style={{ padding: '12px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <p style={{ margin: '4px 0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                        <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.tier.toUpperCase()}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            background: 'rgba(124, 58, 237, 0.08)',
                            border: '1.5px solid rgba(124, 58, 237, 0.15)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            fontSize: '1rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}
