import React, { createContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    isExiting?: boolean;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id' | 'isExiting'>) => string;
    removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) =>
            prev.map((toast) =>
                toast.id === id ? { ...toast, isExiting: true } : toast
            )
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 300);
    }, []);

    const addToast = useCallback(
        (toast: Omit<Toast, 'id' | 'isExiting'>) => {
            const id = Date.now().toString();
            const newToast: Toast = {
                ...toast,
                id,
                duration: toast.duration ?? 3000,
            };

            setToasts((prev) => [...prev, newToast]);

            // Auto-dismiss after duration
            if (newToast.duration > 0) {
                setTimeout(() => removeToast(id), newToast.duration);
            }

            return id;
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}
