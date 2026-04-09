import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: number;
    email: string;
    tier: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isPremium: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('em_token');
        const storedUser = localStorage.getItem('em_user');
        if (stored && storedUser) {
            setToken(stored);
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
        }
    }, []);

    // Setup axios interceptor to add token to all requests
    useEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            const token = localStorage.getItem('em_token');
            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    const saveAuth = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('em_token', newToken);
        localStorage.setItem('em_user', JSON.stringify(newUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const login = async (email: string, password: string) => {
        const apiURL = 'https://estimate-api-vgw1.onrender.com';
        const res = await axios.post(`${apiURL}/api/auth/login`, { email, password });
        saveAuth(res.data.token, res.data.user);
    };

    const register = async (email: string, password: string) => {
        const apiURL = 'https://estimate-api-vgw1.onrender.com';
        const res = await axios.post(`${apiURL}/api/auth/register`, { email, password });
        saveAuth(res.data.token, res.data.user);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('em_token');
        localStorage.removeItem('em_user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const refreshUser = async () => {
        try {
            const apiURL = 'https://estimate-api-vgw1.onrender.com';
            const res = await axios.get(`${apiURL}/api/settings`);
            const updated = { id: res.data.id, email: res.data.email, tier: res.data.subscription_tier };
            setUser(updated);
            localStorage.setItem('em_user', JSON.stringify(updated));
        } catch (_) { /* ignore */ }
    };

    const isPremium = user?.tier === 'premium';

    return (
        <AuthContext.Provider value={{ user, token, isPremium, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
