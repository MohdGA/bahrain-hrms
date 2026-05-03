import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './store/authStore';
import AppLayout   from './components/Layout/AppLayout';
import Dashboard   from './pages/Dashboard';
import Employees   from './pages/Employees';
import WPS         from './pages/WPS';
import SIO         from './pages/SIO';
import Login       from './pages/Login';
import Placeholder from './pages/Placeholder';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <PrivateRoute>
          <AppLayout>
            <Routes>
              <Route path="/"            element={<Dashboard />} />
              <Route path="/employees"   element={<Employees />} />
              <Route path="/wps"         element={<WPS />} />
              <Route path="/sio"         element={<SIO />} />
              <Route path="/recruitment" element={<Placeholder title="Recruitment" />} />
              <Route path="/performance" element={<Placeholder title="Performance" />} />
              <Route path="/schedule"    element={<Placeholder title="Schedule" />} />
              <Route path="/analytics"   element={<Placeholder title="Analytics" />} />
              <Route path="/projects"    element={<Placeholder title="Projects" />} />
              <Route path="/settings"    element={<Placeholder title="Settings" />} />
              <Route path="/help"        element={<Placeholder title="Help & Support" />} />
              <Route path="/contact"     element={<Placeholder title="Contact Us" />} />
              <Route path="/account"     element={<Placeholder title="Account Information" />} />
            </Routes>
          </AppLayout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '13px' } }} />
      <AppRoutes />
    </AuthProvider>
  );
}
