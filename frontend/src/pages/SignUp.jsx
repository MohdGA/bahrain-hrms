import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import api from '../utils/api';
import Logo from '../components/Logo';

const DEPARTMENTS = [
  'Engineering', 'Finance', 'Human Resources', 'Operations',
  'Sales', 'Marketing', 'Legal', 'IT', 'Administration',
];

export default function SignUp() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    position: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError('Password must include at least one uppercase letter and one number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/employees/register', form);
      const { token, data } = res.data;
      setAuth(token, data);
      navigate('/');
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">

        <div className="mb-8">
          <Logo size={36} textClass="text-xl" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Create account</h2>
        <p className="text-sm text-gray-500 mb-6">Fill in your details to get started</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
              <input
                name="firstName"
                required
                value={form.firstName}
                onChange={change}
                placeholder="Mohammed"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
              <input
                name="lastName"
                required
                value={form.lastName}
                onChange={change}
                placeholder="Al Khalifa"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={change}
              placeholder="you@company.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={change}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Department</label>
              <select
                name="department"
                required
                value={form.department}
                onChange={change}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select…</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Position</label>
              <input
                name="position"
                required
                value={form.position}
                onChange={change}
                placeholder="e.g. Engineer"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
