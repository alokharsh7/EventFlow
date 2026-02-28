import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });
            const { user, token } = res.data.data;

            login({ user, token });

            // Redirect based on role (or to saved URL)
            const from = location.state?.from?.pathname;
            if (from) {
                navigate(from, { replace: true });
            } else if (user.role === 'organizer') {
                navigate('/organizer/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-gray-400">Sign in to your EventFlow account</p>
                </div>

                {/* Card */}
                <form onSubmit={handleSubmit}
                    className="bg-surface-light border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Email
                        </label>
                        <input id="email" type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50
                         focus:border-primary-500 transition-all"
                            placeholder="you@example.com" />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Password
                        </label>
                        <input id="password" type="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-white
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50
                         focus:border-primary-500 transition-all"
                            placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/25
                       hover:shadow-primary-500/40 active:scale-[0.98]">
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>

                    <p className="text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
