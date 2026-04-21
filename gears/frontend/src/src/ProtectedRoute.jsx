import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({children}) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // Si pas authentifié, on redirige vers la page login
  // Sinon, on affiche les composants enfants (Outlet)
  return isAuthenticated ? children  : <Navigate to="/" replace />;
};

export default ProtectedRoute;