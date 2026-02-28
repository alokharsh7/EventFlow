import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';

interface Props {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
