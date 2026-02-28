import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const NavLinks = () => {
    if (!user) return null;

    if (user.role === 'organizer') {
      return (
        <>
          <Link to="/organizer/dashboard" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Dashboard</Link>
          <Link to="/organizer/events/create" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Create Event</Link>
          <Link to="/organizer/analytics" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Analytics</Link>
        </>
      );
    }

    return (
      <>
        <Link to="/" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Browse Events</Link>
        <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">My Bookings</Link>
        <Link to="/waitlist" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Waitlist</Link>
      </>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          ⚡ Event<span className="text-primary">Flow</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLinks />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                Login
              </Link>
              <Link to="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent-bright transition-colors shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden animate-fade-in">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
            <NavLinks />
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
