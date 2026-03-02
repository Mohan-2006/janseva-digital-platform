import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { Suspense, lazy } from 'react';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const CitizenDashboard = lazy(() => import('./pages/citizen/Dashboard'));
const ServicesList = lazy(() => import('./pages/citizen/ServicesList'));
const ApplyService = lazy(() => import('./pages/citizen/ApplyService'));
const TrackApplication = lazy(() => import('./pages/citizen/TrackApplication'));
const OfficerDashboard = lazy(() => import('./pages/officer/Dashboard'));
const ReviewApplication = lazy(() => import('./pages/officer/ReviewApplication'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Route guard components
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    if (user?.role === 'officer') return <Navigate to="/officer" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-blue-900 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { background: '#1e3a5f', color: '#fff', fontSize: '14px' }
        }}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Citizen routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute roles={['citizen']}><ServicesList /></ProtectedRoute>} />
          <Route path="/apply/:serviceId" element={<ProtectedRoute roles={['citizen']}><ApplyService /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute roles={['citizen']}><TrackApplication /></ProtectedRoute>} />

          {/* Officer routes */}
          <Route path="/officer" element={<ProtectedRoute roles={['officer', 'admin']}><OfficerDashboard /></ProtectedRoute>} />
          <Route path="/officer/review/:id" element={<ProtectedRoute roles={['officer', 'admin']}><ReviewApplication /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
