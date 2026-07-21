'use client';
import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';

type User = { id: number; username: string; email: string } | null;

type AuthContextType = {
    user: User;
    loading: boolean;
    signin: (username: string, password: string) => Promise<void>;
    signup: (
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async () => {
        try {
            const res = await fetch(`${API_BASE}/me`, {
                credentials: 'include',
            });
            if (res.ok) setUser(await res.json());
            else setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const signin = async (username: string, password: string) => {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.message ?? 'Invalid credentials');
        setUser(payload);
    };

    const signup = async (
        username: string,
        email: string,
        password: string
    ) => {
        const res = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.message ?? 'Sign up failed');
        setUser(payload);
    };

    const logout = async () => {
        await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signin, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
