import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
    { to: '/projects', label: 'Projects', icon: '◈' },
    { to: '/estimate', label: 'Estimate', icon: '◎' },
    { to: '/taskboard', label: 'Task Board', icon: '◆' },
    { to: '/insights', label: 'Insights', icon: '◇', premium: true },
    { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function DashboardLayout() {
    const { user, isPremium, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside style={{
                width: 240,
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0',
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                height: '100vh',
            }}>
                {/* Logo */}
                <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: -0.5 }}>estiMate</span>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(({ to, label, icon, premium }) => (
                        <NavLink
                            key={to}
                            to={to}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                color: isActive ? 'var(--purple-400)' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.9rem',
                                transition: 'var(--transition)',
                                textDecoration: 'none',
                            })}
                        >
                            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
                            {label}
                            {premium && !isPremium && (
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '0.65rem',
                                    padding: '2px 6px',
                                    background: 'rgba(251,191,36,0.1)',
                                    color: 'var(--warning)',
                                    border: '1px solid rgba(251,191,36,0.2)',
                                    borderRadius: 20,
                                    fontWeight: 700,
                                }}>PRO</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User block */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--gradient-purple)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.9rem', color: '#fff',
                            flexShrink: 0,
                        }}>
                            {user?.email[0].toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.email}
                            </div>
                            <div style={{ fontSize: '0.7rem' }}>
                                {isPremium
                                    ? <span style={{ color: 'var(--warning)' }}>✦ Premium</span>
                                    : <span style={{ color: 'var(--text-muted)' }}>Free tier</span>}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>Sign out</button>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto', maxWidth: '100%' }}>
                <Outlet />
            </main>
        </div>
    );
}
