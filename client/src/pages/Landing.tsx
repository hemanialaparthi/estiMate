import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

// Uncomment if needed for future sections
/*
const features = [
    {
        icon: '◈',
        title: 'Upload Your History',
        desc: 'Connect GitHub repos, drag-drop CSVs, or manually enter past projects. We normalize everything into clean data.',
    },
    {
        icon: '◎',
        title: 'Get Real Estimates',
        desc: 'Based on YOUR team\'s actual velocity and project history. No academic models, no guessing - real data.',
    },
    {
        icon: '◇',
        title: 'Premium: Crowd Data',
        desc: "Tap into 1,800+ real projects from other engineering teams. Better accuracy, wider confidence ranges.",
    },
];
*/

const coreFeatures = [
    {
        icon: '📊',
        title: 'Multi-Source Data Import',
        desc: 'GitHub integration, CSV uploads, or manual entry. Three ways to input your project history.'
    },
    {
        icon: '🚀',
        title: 'Intelligent Velocity Tracking',
        desc: 'Automatically calculates your team\'s LOC/day and project velocity over time.'
    },
    {
        icon: '🎯',
        title: 'AI-Powered Estimates',
        desc: 'Machine learning finds similar projects and predicts timelines with confidence scores.'
    },
    {
        icon: '📈',
        title: '1,800+ Crowd Projects',
        desc: 'Benchmark against real data from hundreds of engineering teams (premium).'
    },
    {
        icon: '📋',
        title: 'Auto Task Breakdown',
        desc: 'Generates 15 tasks across 5 phases with time estimates for each deliverable.'
    },
    {
        icon: '🔄',
        title: 'Kanban Task Board',
        desc: 'Visual project management with drag-and-drop workflow and real-time collaboration.'
    },
    {
        icon: '📥',
        title: 'Export & Share',
        desc: 'Download tasks as CSV, generate shareable links, and collaborate with your team.'
    },
    {
        icon: '🔐',
        title: 'Enterprise Security',
        desc: 'JWT authentication, PBKDF2 hashing, SSL/TLS, and ISO 900 compliance.'
    },
];

// Uncomment if needed for future sections
/*
const benefits = [
    { icon: '⏰', title: 'Save 20+ hours', desc: 'Auto-generates tasks instead of manual planning' },
    { icon: '✅', title: '60% More Accurate', desc: 'Data-driven estimates beat manual guessing' },
    { icon: '📈', title: 'Track Improvements', desc: 'See velocity trends and optimize team performance' },
    { icon: '🤝', title: 'Better Collaboration', desc: 'Share estimates and tasks with your entire team' },
    { icon: '💰', title: 'Reduce Overruns', desc: 'Catch timeline risks before they happen' },
    { icon: '🎓', title: 'Team Learning', desc: 'Understand patterns in project execution' },
];
*/

const faqs = [
    {
        q: 'How accurate are the estimates?',
        a: 'Accuracy depends on your historical data. With 5+ projects of similar scope, you can expect 40-60% accuracy improvement over manual estimates. Our crowd data provides additional benchmarking for better results.',
    },
    {
        q: 'What if I don\'t have GitHub repos?',
        a: 'No problem! You can manually add projects or upload a CSV file. estiMate works with any project data format. We also provide 1,800+ crowd projects to get you started.',
    },
    {
        q: 'Is my data private?',
        a: 'Yes. Your project data is encrypted and never shared unless you explicitly share projects. We use enterprise-grade security (SSL/TLS, PBKDF2 hashing, JWT auth).',
    },
    {
        q: 'Can I share estimates with my team?',
        a: 'Absolutely! Generate shareable links, export tasks as CSV, and collaborate in real-time. Teams can view estimates and manage tasks together.',
    },
    {
        q: 'What\'s the difference between pricing tiers?',
        a: 'Free ($0): 1 user, 10 estimates/mo, test drive. Pro ($39/mo): 1 user, 100 estimates/mo, for solo consultants. Team ($149/mo): Up to 10 users, 500 estimates/mo, real-time collaboration. Business ($349/mo): Up to 30 users, 2,000 estimates/mo, priority support & API access.',
    },
    {
        q: 'Do you offer API access?',
        a: 'Currently, API access is available for premium users. Contact our team for enterprise API options and custom integrations.',
    },
];

const pricingFree = [
    '1 user',
    '10 estimates/month',
    '5 active projects',
    'Manual data entry only',
];

const pricingPro = [
    '1 user (invite read-only viewers)',
    '100 estimates/month',
    'Unlimited projects',
    'GitHub & CSV integration',
    'Industry benchmarking (1,800+ real projects)',
    'Velocity trends & team performance insights',
];

const pricingTeam = [
    'Up to 10 users',
    '500 estimates/month',
    'Everything in Pro',
    'Real-time collaboration',
    'Shared workspace',
    'Team activity logs',
];

const pricingBusiness = [
    'Up to 30 users',
    '2,000 estimates/month',
    'Everything in Team',
    'Priority support',
    'Advanced security & compliance',
    'API access & custom integrations',
];

export default function Landing() {
    const navigate = useNavigate();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [featureIndex, setFeatureIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToFeature = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.offsetWidth;
            container.scrollLeft = index * cardWidth;
        }
    };

    const handleManualScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.offsetWidth;
            const currentIndex = Math.round(container.scrollLeft / cardWidth);
            setFeatureIndex(currentIndex);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Navbar */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 40px',
                background: 'rgba(7,7,15,0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: -0.5 }}>estiMate</span>
                <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }}>
                    <button 
                        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                    >
                        About
                    </button>
                    <button 
                        onClick={() => document.getElementById('core-features')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                    >
                        Core Features
                    </button>
                    <button 
                        onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                    >
                        FAQs
                    </button>
                    <button 
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                    >
                        Pricing
                    </button>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>Sign in</button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>Get started free</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '80vh',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center',
                padding: '80px 40px 60px',
                background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: '10%', left: '5%', width: 300, height: 300,
                    borderRadius: '50%', background: 'rgba(124,58,237,0.06)',
                    filter: 'blur(80px)', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '15%', right: '8%', width: 250, height: 250,
                    borderRadius: '50%', background: 'rgba(99,102,241,0.08)',
                    filter: 'blur(60px)', pointerEvents: 'none',
                }} />

                <div className="badge badge-purple" style={{ marginBottom: 24 }}>
                    ✦ Built for All Engineering Teams
                </div>

                <h1 style={{ maxWidth: 780, marginBottom: 24, letterSpacing: -1 }}>
                    Estimate your next project
                    <br />
                    <span className="gradient-text">with real team data</span>
                </h1>

                <p style={{
                    maxWidth: 560, marginBottom: 40, fontSize: '1.15rem',
                    color: 'var(--text-secondary)', lineHeight: 1.7,
                }}>
                    60% of software projects miss their deadlines. Stop guessing.
                    Upload your project history and get estimates backed by
                    your actual team velocity - plus crowd data from 1,800+ real projects.
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
                        Start estimating free →
                    </button>
                    <button className="btn btn-outline btn-lg" onClick={() => { 
                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        See how it works
                    </button>
                </div>

                <div style={{ marginTop: 56, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Trusted by engineering teams at fast-growing startups · 1,800+ projects analyzed
                </div>
            </section>

            {/* About Section */}
            <section id="about" style={{
                padding: '80px 40px',
                background: 'rgba(124,58,237,0.02)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ marginBottom: 12 }}>What is estiMate?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                            estiMate is an AI-powered estimation platform that transforms your project history into accurate, data-driven timelines. Stop relying on intuition - let real data guide your planning.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                        <div>
                            <h3 style={{ marginBottom: 24, fontSize: '1.3rem' }}>The Problem We Solve</h3>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <li style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--warning)', flexShrink: 0 }}>⚠</span>
                                    <span>60% of projects miss deadlines due to poor estimation</span>
                                </li>
                                <li style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--warning)', flexShrink: 0 }}>⚠</span>
                                    <span>Manual estimation relies on gut feel, not historical data</span>
                                </li>
                                <li style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--warning)', flexShrink: 0 }}>⚠</span>
                                    <span>Team velocity is rarely measured or tracked</span>
                                </li>
                                <li style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--warning)', flexShrink: 0 }}>⚠</span>
                                    <span>No benchmarking against similar projects in industry</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 style={{ marginBottom: 24, fontSize: '1.3rem' }}>Our Solution</h3>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <li style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
                                    <span>Three ways to add projects: GitHub, CSV, or manual entry</span>
                                </li>
                                <li style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
                                    <span>ML algorithms calculate your team's unique velocity</span>
                                </li>
                                <li style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
                                    <span>Compare against 1,800+ crowd-sourced projects</span>
                                </li>
                                <li style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span>
                                    <span>Get confidence scores on every estimate</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" style={{
                padding: '80px 40px',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <h2 style={{ marginBottom: 12 }}>How It Works</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Four simple steps to accurate project estimates</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                    {[
                        { num: '1', title: 'Add Your Projects', desc: 'Import from GitHub, upload CSV, or manually enter your project history' },
                        { num: '2', title: 'Calculate Velocity', desc: 'estiMate analyzes your data to determine your team\'s LOC/day and productivity' },
                        { num: '3', title: 'Get Estimates', desc: 'Input a new project scope and get data-driven estimates with confidence scores' },
                        { num: '4', title: 'Generate Tasks', desc: 'Automatically break projects into 15 tasks across 5 phases with time estimates' },
                    ].map((step) => (
                        <div key={step.num} style={{
                            position: 'relative',
                            padding: '32px 24px',
                            background: 'rgba(124,58,237,0.08)',
                            border: '1px solid rgba(124,58,237,0.15)',
                            borderRadius: 14,
                            textAlign: 'center',
                        }}>
                            <div style={{
                                position: 'absolute', top: -16, left: -16,
                                width: 48, height: 48,
                                background: 'var(--gradient-purple)',
                                color: '#fff',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 12,
                            }}>
                                {step.num}
                            </div>
                            <h3 style={{ marginTop: 16, marginBottom: 8 }}>{step.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
                </div>
            </section>

            {/* Core Features Carousel */}
            <section id="core-features" style={{
                padding: '80px 40px',
                background: 'rgba(124,58,237,0.03)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 1300, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ marginBottom: 12 }}>Core Features</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Everything you need for accurate project planning</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleManualScroll}
                            style={{
                                display: 'flex',
                                gap: 24,
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                scrollBehavior: 'smooth',
                                scrollSnapType: 'x mandatory',
                                paddingBottom: 16,
                            }}
                        >
                            {coreFeatures.map((f) => (
                                <div
                                    key={f.title}
                                    style={{
                                        minWidth: '100%',
                                        flexShrink: 0,
                                        scrollSnapAlign: 'start',
                                    }}
                                >
                                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center', padding: '40px 32px', height: '100%' }}>
                                        <div style={{ fontSize: '3.5rem' }}>{f.icon}</div>
                                        <h3 style={{ fontSize: '1.3rem' }}>{f.title}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                            {coreFeatures.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setFeatureIndex(idx);
                                        scrollToFeature(idx);
                                    }}
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: idx === featureIndex ? 'var(--purple-400)' : 'rgba(124,58,237,0.2)',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" style={{
                padding: '80px 40px',
                background: 'rgba(124,58,237,0.04)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ marginBottom: 12 }}>Frequently Asked Questions</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {faqs.map((faq, idx) => (
                            <div key={idx} style={{
                                border: '1px solid var(--border)',
                                borderRadius: 10,
                                overflow: 'hidden',
                            }}>
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                    style={{
                                        width: '100%',
                                        padding: '18px 20px',
                                        background: expandedFaq === idx ? 'rgba(124,58,237,0.1)' : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontWeight: 600,
                                        textAlign: 'left',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    <span>{faq.q}</span>
                                    <span style={{
                                        transition: 'transform 0.2s',
                                        transform: expandedFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                                    }}>
                                        ▼
                                    </span>
                                </button>
                                {expandedFaq === idx && (
                                    <div style={{
                                        padding: '12px 20px 18px',
                                        borderTop: '1px solid var(--border)',
                                        color: 'var(--text-secondary)',
                                        lineHeight: 1.7,
                                        background: 'rgba(124,58,237,0.02)',
                                        fontSize: '0.95rem',
                                    }}>
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" style={{
                padding: '80px 40px',
                background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.05))',
            }}>
                <div style={{ maxWidth: 1300, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <h2 style={{ marginBottom: 12 }}>Simple, transparent pricing</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Pay per month or annually and save 17%. All annual plans include discounts.</p>
                    </div>
                    
                    {/* Main grid with Business tier featured */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, alignItems: 'start' }}>
                        {/* Free */}
                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge badge-purple">Free</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1 user</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: '2.8rem', fontWeight: 800 }}>$0</div>
                            </div>
                            <div style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>Forever free</div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'auto', paddingBottom: 24 }}>
                                {pricingFree.map((f) => (
                                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                        <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span> <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="btn btn-outline btn-full" onClick={() => navigate('/auth')}>Get started</button>
                        </div>

                        {/* Pro */}
                        <div className="card card-glow" style={{ position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                position: 'absolute', top: 0, right: 0, left: 0, height: 2,
                                background: 'var(--gradient-purple)',
                            }} />
                            <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge badge-gold">✦ Pro</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1 user</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: '2.8rem', fontWeight: 800 }}>$39<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span></div>
                            </div>
                            <div style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>$390/year (save 17%)</div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'auto', paddingBottom: 24 }}>
                                {pricingPro.map((f) => (
                                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                        <span style={{ color: 'var(--purple-400)', flexShrink: 0 }}>✦</span> <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="btn btn-primary btn-full" onClick={() => navigate('/auth')}>Try free for 14 days</button>
                        </div>

                        {/* Team */}
                        <div className="card card-glow" style={{ position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                position: 'absolute', top: 0, right: 0, left: 0, height: 2,
                                background: 'var(--gradient-purple)',
                            }} />
                            <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge badge-gold">⭐ Team</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Up to 10</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: '2.8rem', fontWeight: 800 }}>$149<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span></div>
                            </div>
                            <div style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>$1,490/year (save 17%)</div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'auto', paddingBottom: 24 }}>
                                {pricingTeam.map((f) => (
                                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                        <span style={{ color: 'var(--purple-400)', flexShrink: 0 }}>✦</span> <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="btn btn-primary btn-full" onClick={() => navigate('/auth')}>Try free for 14 days</button>
                        </div>

                        {/* Business - FEATURED */}
                        <div className="card card-glow" style={{ 
                            position: 'relative', 
                            overflow: 'hidden', 
                            border: '2px solid var(--purple-400)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 60px rgba(124,58,237,0.15)',
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, right: 0, left: 0, height: 3,
                                background: 'var(--gradient-purple)',
                            }} />
                            <div style={{ 
                                marginBottom: 18, 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                gap: 8,
                            }}>
                                <span className="badge badge-gold">🚀 Business</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'rgba(124,58,237,0.2)', color: 'var(--purple-400)', padding: '4px 8px', borderRadius: 4 }}>BEST VALUE</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--purple-400)' }}>$349<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span></div>
                            </div>
                            <div style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>$3,490/year (save 17%)</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--purple-400)', marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid rgba(124,58,237,0.1)' }}>Up to 30 users • 2,000 estimates/mo</div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'auto', paddingBottom: 24 }}>
                                {pricingBusiness.map((f) => (
                                    <li key={f} style={{ display: 'flex', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                        <span style={{ color: 'var(--purple-400)', flexShrink: 0 }}>✦</span> <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="btn btn-primary btn-full" onClick={() => navigate('/auth')} style={{ background: 'var(--gradient-purple)' }}>Try free for 14 days</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{
                padding: '80px 40px',
                textAlign: 'center',
                borderTop: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <h2 style={{ marginBottom: 20 }}>Ready to estimate smarter?</h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: 40,
                        fontSize: '1.05rem',
                        lineHeight: 1.7,
                    }}>
                        Join engineering teams who've ditched guesswork and embraced data-driven planning.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
                            Get started free today
                        </button>
                        <button className="btn btn-outline btn-lg" onClick={() => navigate('/auth')}>
                            Schedule a demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                textAlign: 'center', padding: '40px',
                borderTop: '1px solid var(--border)',
                color: 'var(--text-muted)', fontSize: '0.85rem',
            }}>
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20, fontSize: '0.9rem' }}>
                        <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            Privacy
                        </button>
                        <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            Terms
                        </button>
                        <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            Contact
                        </button>
                        <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            Docs
                        </button>
                    </div>
                </div>
                © 2026 estiMate · Built for engineering teams who care about accuracy
            </footer>
        </div>
    );
}
