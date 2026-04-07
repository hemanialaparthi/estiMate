export function SkeletonLoader({ count = 3, lines = 3 }: { count?: number; lines?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-card">
                    {Array.from({ length: lines }).map((_, j) => (
                        <div
                            key={j}
                            className={`skeleton skeleton-text ${j === lines - 1 ? 'short' : ''}`}
                        />
                    ))}
                </div>
            ))}
        </>
    );
}

export function SkeletonInput() {
    return <div className="skeleton" style={{ height: 44, width: '100%', marginBottom: 16 }} />;
}

export function SkeletonStats() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-line" style={{ width: '60%', height: 28 }} />
                    <div className="skeleton skeleton-line short" />
                </div>
            ))}
        </div>
    );
}

export function EmptyState({
    icon = '◎',
    title = 'No data',
    description = 'Get started by creating something new',
    action,
}: {
    icon?: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-text">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
