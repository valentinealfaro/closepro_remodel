import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import Widget from './pages/Widget';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, userData, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50"><div className="w-8 h-8 border-4 border-blue-electric/20 border-t-blue-electric rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  const isSuperAdmin = user?.email?.toLowerCase().trim() === 'info@vcvservices.com' ||
                       user?.email?.toLowerCase().trim() === 'lawtonroofer@gmail.com';
  if (role && userData?.role !== role && !isSuperAdmin) return <Navigate to="/app" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            {/* Public site */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Embeddable widget — no layout, no auth */}
            <Route path="/widget/:tenantId" element={<Widget />} />
            <Route path="/widget" element={<Widget />} />

            {/* Dashboard */}
            <Route path="/app/*" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/*" element={
              <ProtectedRoute role="super_admin">
                <ErrorBoundary><Admin /></ErrorBoundary>
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Router>
      </HelmetProvider>
    </AuthProvider>
  );
}
