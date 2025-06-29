
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../services/AuthService';
import { JSX } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = getAccessToken();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};


export default ProtectedRoute;
