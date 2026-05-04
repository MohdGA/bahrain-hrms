import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../store/authStore';

const DEPARTMENTS = [
  'Engineering', 'Finance', 'Human Resources', 'Operations',
  'Sales', 'Marketing', 'Legal', 'IT', 'Administration',
];

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    department: '', position: '', role: 'employee', isBahraini: false,
  });
  const [errors, setErrors]   = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName  = 'First name is required';
    if (!form.lastName.trim())   e.lastName   = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password  = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Password must include an uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Password must include a number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.department)        e.department = 'Select a department';
    if (!form.position.trim())   e.position   = 'Job position is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { confirmPassword, isBahraini, ...payload } = form;
    const cleanPayload = { ...payload, isBahraini };
      const res = await api.post('/employees/register', cleanPayload);
      const { token, data } = res.data;
      login(token, data);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
      else if (msg.toLowerCase().includes('cpr')) setErrors({ cprNumber: msg });
      else setErrors({ _global: msg });
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (() => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-400', width: 'w-2/4' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg mb-4">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Bahrain HRMS — Join your team</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <p className="text-sm text-green-700 font-medium">Account created! Redirecting to dashboard…</p>
            </div>
          )}

          {errors._global && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{errors._global}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">First Name *</label>
                <input
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="Mohammed"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                <FieldError msg={errors.firstName} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Last Name *</label>
                <input
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  placeholder="Al Khalifa"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                <FieldError msg={errors.lastName} />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Work Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="mohammed@company.com.bh"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              <FieldError msg={errors.email} />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password *</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`w-full border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwStrength && (
                  <div className="mt-1.5">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pwStrength.color} ${pwStrength.width}`} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{pwStrength.label}</p>
                  </div>
                )}
                <FieldError msg={errors.password} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showCpw ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  />
                  <button type="button" onClick={() => setShowCpw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCpw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <FieldError msg={errors.confirmPassword} />
              </div>
            </div>

            {/* Department + Position */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Department *</label>
                <select
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors ${errors.department ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <FieldError msg={errors.department} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Job Position *</label>
                <input
                  value={form.position}
                  onChange={e => set('position', e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors ${errors.position ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                <FieldError msg={errors.position} />
              </div>
            </div>

            {/* Bahraini toggle */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.isBahraini} onChange={e => set('isBahraini', e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
              <div>
                <p className="text-xs font-semibold text-gray-700">Bahraini National</p>
                <p className="text-[11px] text-gray-400">Required for Bahrainisation compliance tracking</p>
              </div>
            </div>

            <button type="submit" disabled={loading || success}
              className="w-full btn-primary py-3 text-sm font-semibold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Bahrain HRMS · Labour Law No. 36 of 2012 · PDPL Compliant
        </p>
      </div>
    </div>
  );
}
