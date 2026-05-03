import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './store/authStore.jsx';
import AppLayout    from './components/Layout/AppLayout';
import Dashboard    from './pages/Dashboard';
import Employees    from './pages/Employees';
import Recruitment  from './pages/Recruitment';
import Performance  from './pages/Performance';
import Schedule     from './pages/Schedule';
import Analytics    from './pages/Analytics';
import Projects     from './pages/Projects';
import Settings     from './pages/Settings';
import Account      from './pages/Account';
import WPS          from './pages/WPS';
import SIO          from './pages/SIO';
import Login        from './pages/Login';
import Placeholder  from './pages/Placeholder';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
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
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/schedule"    element={<Schedule />} />
              <Route path="/analytics"   element={<Analytics />} />
              <Route path="/projects"    element={<Projects />} />
              <Route path="/wps"         element={<WPS />} />
              <Route path="/sio"         element={<SIO />} />
              <Route path="/settings"    element={<Settings />} />
              <Route path="/account"     element={<Account />} />
              <Route path="/help"        element={<Placeholder title="Help & Support" />} />
              <Route path="/contact"     element={<Placeholder title="Contact Us" />} />
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
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontSize: '13px' },
        success: { iconTheme: { primary: '#3B6FE8', secondary: '#fff' } },
      }} />
      <AppRoutes />
    </AuthProvider>
  );
}
