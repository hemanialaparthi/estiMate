import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Auth() {
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const validateEmail = (value: string): string => {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email';
        return '';
    };

    const validatePassword = (value: string): string => {
        if (!value) return 'Password is required';
        if (tab === 'register' && value.length < 6) {
            return 'Password must be at least 6 characters';
        }
        return '';
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setEmailError(validateEmail(value));
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setPasswordError(validatePassword(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
        setEmailError(emailErr);
        setPasswordError(passwordErr);

        if (emailErr || passwordErr) {
            addToast({
                type: 'error',
                title: 'Form Error',
                message: 'Please fix the errors above',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            if (tab === 'login') {
                await login(email, password);
                addToast({
                    type: 'success',
                    title: 'Welcome back!',
                    message: `Logged in as ${email}`,
                    duration: 2000,
                });
            } else {
                await register(email, password);
                addToast({
                    type: 'success',
                    title: 'Account created!',
                    message: 'Welcome to estiMate',
                    duration: 2000,
                });
            }
            navigate('/dashboard');
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message || 
                  (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'An error occurred'
                : 'An error occurred';
            addToast({
                type: 'error',
                title: 'Authentication failed',
                message: msg,
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(124,58,237,0.12) 0%, var(--bg-primary) 60%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px',
        }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h2 style={{ marginBottom: 4, letterSpacing: -0.5 }}>estiMate</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Project estimation with real team data</p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '32px',
                    boxShadow: 'var(--shadow-lg)',
                }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
                        {(['login', 'register'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(''); }}
                                style={{
                                    flex: 1, padding: '10px', background: 'none', border: 'none',
                                    color: tab === t ? 'var(--purple-400)' : 'var(--text-muted)',
                                    fontWeight: tab === t ? 600 : 500,
                                    fontSize: '0.9rem', fontFamily: 'var(--font)',
                                    cursor: 'pointer', transition: 'var(--transition)',
                                    borderBottom: `2px solid ${tab === t ? 'var(--purple-500)' : 'transparent'}`,
                                    marginBottom: -1,
                                }}
                            >
                                {t === 'login' ? 'Sign in' : 'Create account'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <input
                                className={`form-input ${emailError ? 'error' : ''}`}
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                                required
                                autoFocus
                                aria-invalid={!!emailError}
                                aria-describedby={emailError ? 'email-error' : undefined}
                            />
                            {emailError && (
                                <div className="form-error" id="email-error">
                                    <span>⚠</span> {emailError}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                className={`form-input ${passwordError ? 'error' : ''}`}
                                type="password"
                                placeholder={tab === 'register' ? 'At least 6 characters' : '••••••••'}
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                onBlur={(e) => setPasswordError(validatePassword(e.target.value))}
                                required
                                minLength={6}
                                aria-invalid={!!passwordError}
                                aria-describedby={passwordError ? 'password-error' : undefined}
                            />
                            {passwordError && (
                                <div className="form-error" id="password-error">
                                    <span>⚠</span> {passwordError}
                                </div>
                            )}
                        </div>

                        <button 
                            className={`btn btn-primary btn-full btn-lg ${loading ? 'loading' : ''}`} 
                            type="submit" 
                            disabled={loading || !email || !password}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" /> Processing…
                                </>
                            ) : (
                                tab === 'login' ? 'Sign in →' : 'Create account →'
                            )}
                        </button>
                    </form>

                    <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--purple-400)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.82rem' }}
                        >
                            {tab === 'login' ? 'Sign up free' : 'Sign in'}
                        </button>
                    </p>
                </div>

                <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Free forever. No credit card required.
                </p>
            </div>
        </div>
    );
}
