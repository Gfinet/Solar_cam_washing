import { Navigate, Outlet } from 'react-router-dom';

function isTokenValid(token)
{
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false
  }
}


const ProtectedRoute = ({children}) => {
  const token = localStorage.getItem('token');
  if (!token || !isTokenValid(token))
    localStorage.removeItem('token');
  return token ? children  : <Navigate to="/" replace />;
};

export default ProtectedRoute;