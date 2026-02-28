import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides:
 *  - user, token, isLoading
 *  - login(data), logout()
 *
 * On mount it reads the token from localStorage and fetches /auth/me
 * to hydrate the user state.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('ef_token'));
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate user from token on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.data.user);
            } catch {
                // Token is invalid or expired — clear it
                localStorage.removeItem('ef_token');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, [token]);

    const login = (data) => {
        localStorage.setItem('ef_token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('ef_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook for consuming the auth context.
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
