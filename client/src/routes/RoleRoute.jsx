import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const RoleRoute = ({ roles }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default RoleRoute;