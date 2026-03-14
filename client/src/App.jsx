import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';

function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E75B6]" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children({ user, logout });
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {({ user, logout }) => <Dashboard user={user} logout={logout} />}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
