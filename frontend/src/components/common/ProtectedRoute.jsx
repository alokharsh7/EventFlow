import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

/**
 * Wrapper route that:
 * 1. Shows Loader while auth state is hydrating.
 * 2. Redirects to /login if not authenticated (saving the attempted URL).
 * 3. Redirects to / if the user's role isn't in the allowedRoles list.
 * 4. Renders child routes via <Outlet /> if authorised.
 */
export default function ProtectedRoute({ allowedRoles }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <Loader />;

    if (!user) {
        // Save attempted URL so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
