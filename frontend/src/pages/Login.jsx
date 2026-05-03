import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore.jsx';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">HR</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">kyra.</span>
        </div>

        <div className="card shadow-md">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to Bahrain HRMS</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="james@company.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary py-2.5 text-sm font-semibold disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Bahrain HRMS © 2026 — WPS 2.0 Compliant</p>
      </div>
    </div>
  );
}
