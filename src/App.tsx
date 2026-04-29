import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import BookDemo from './pages/BookDemo';
import Results from './pages/Results';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import AiDemo from './pages/AiDemo';
import IndustryLanding from './pages/IndustryLanding';
import ShareView from './pages/ShareView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
            {/* Marketing Website Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
            <Route path="/features" element={<Layout><Features /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            <Route path="/book-demo" element={<Layout><BookDemo /></Layout>} />
            <Route path="/results" element={<Layout><Results /></Layout>} />
            <Route path="/blog" element={<Layout><Blog /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/faq" element={<Layout><FAQ /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/ai-demo" element={<Layout><AiDemo /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/share/:shareId" element={<ShareView />} />
            <Route path="/:industry" element={<Layout><IndustryLanding /></Layout>} />

            {/* Client Application Routes */}
            <Route path="/app/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Admin Backend Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute role="super_admin">
                <ErrorBoundary>
                  <Admin />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            {/* 404 Catch-all */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Router>
      </HelmetProvider>
    </AuthProvider>
  );
}
