import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';
import { PersonList } from './pages/PersonList';
import { CreatePerson } from './pages/CreatePerson';
import { Wishlist } from './pages/Wishlist';
import { SharedView } from './pages/SharedView';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/share/:shareCode" element={<SharedView />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
      <Route path="/persons" element={<ProtectedRoute><PersonList /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreatePerson /></ProtectedRoute>} />
      <Route path="/list/:personId" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
