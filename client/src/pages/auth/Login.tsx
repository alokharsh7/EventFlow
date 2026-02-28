import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/authApi';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { user, token } = res.data.data;
      login({ user, token });
      toast.success('Welcome back!');
      navigate(user.role === 'organizer' ? '/organizer/dashboard' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[40%] flex-col items-center justify-center relative overflow-hidden bg-card border-r border-border">
        <div className="absolute w-72 h-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="relative z-10 text-center px-8">
          <h1 className="font-display text-4xl font-bold mb-3">⚡ Event<span className="text-primary">Flow</span></h1>
          <p className="text-lg text-muted-foreground mb-8">Your next great experience awaits</p>
          <div className="text-left space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><span className="text-success">✓</span> Secure JWT authentication</p>
            <p className="flex items-center gap-2"><span className="text-success">✓</span> Real-time seat availability</p>
            <p className="flex items-center gap-2"><span className="text-success">✓</span> Instant QR e-tickets</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="font-display text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-elevated px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-accent-bright transition-colors shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
