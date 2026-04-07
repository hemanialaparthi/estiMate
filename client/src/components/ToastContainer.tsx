import { useToast } from '../context/ToastContext';

const toastIcons: Record<string, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type} ${toast.isExiting ? 'exit' : ''}`}
                    role="alert"
                    aria-live="polite"
                >
                    <div className="toast-icon">{toastIcons[toast.type]}</div>
                    <div className="toast-content">
                        {toast.title && (
                            <div className="toast-title">{toast.title}</div>
                        )}
                        {toast.message && (
                            <div className="toast-message">{toast.message}</div>
                        )}
                    </div>
                    <button
                        className="toast-close"
                        onClick={() => removeToast(toast.id)}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
