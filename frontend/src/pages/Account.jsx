import { useState, useEffect } from 'react';
import { Save, User, Lock, Shield } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../store/authStore.jsx';
import toast from 'react-hot-toast';

export default function Account() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('profile');
  const [saving, setSaving]   = useState(false);
  const [profile, setProfile] = useState({ firstName:'', lastName:'', email:'', phone:'', department:'', designation:'' });
  const [pwd, setPwd]         = useState({ current:'', newPwd:'', confirm:'' });

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/employees/${user.id}`).then(r => {
      const d = r.data.data;
      setProfile({ firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone || '', department: d.department, designation: d.designation });
    }).catch(() => {});
  }, [user?.id]);

  const setP = f => e => setProfile(p => ({ ...p, [f]: e.target.value }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/employees/${user.id}`, profile);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (pwd.newPwd !== pwd.confirm) return toast.error('New passwords do not match');
    if (pwd.newPwd.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api.put(`/employees/${user.id}`, { password: pwd.newPwd });
      toast.success('Password updated!');
      setPwd({ current:'', newPwd:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const TABS = [
    { key:'profile', label:'My Profile', icon: User },
    { key:'security',label:'Password',   icon: Lock },
    { key:'pdpl',    label:'PDPL',       icon: Shield },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Account</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal details and security</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-44 shrink-0 space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === key ? 'bg-primary-50 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          {tab === 'profile' && (
            <div className="card space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary text-2xl font-bold">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{profile.firstName} {profile.lastName}</p>
                  <p className="text-sm text-gray-400">{profile.designation} — {profile.department}</p>
                  <span className="text-xs bg-primary-50 text-primary px-2.5 py-0.5 rounded-full font-medium capitalize mt-1 inline-block">
                    {user?.role?.replace('_',' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['First Name', 'firstName', 'James'],
                  ['Last Name',  'lastName',  'Franklyn'],
                  ['Email',      'email',     'james@company.com'],
                  ['Phone',      'phone',     '+973 3X XX XXXX'],
                ].map(([label, field, ph]) => (
                  <div key={field}>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                    <input value={profile[field] || ''} onChange={setP(field)} placeholder={ph}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100" />
                  </div>
                ))}
              </div>
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-xs disabled:opacity-60">
                <Save size={13} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}

          {tab === 'security' && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-800">Change Password</h3>
              {[
                ['New Password',     'newPwd',  'Min. 6 characters'],
                ['Confirm Password', 'confirm', 'Repeat new password'],
              ].map(([label, field, ph]) => (
                <div key={field}>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                  <input type="password" value={pwd[field]} onChange={e => setPwd(p => ({...p, [field]: e.target.value}))}
                    placeholder={ph} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100" />
                </div>
              ))}
              <button onClick={savePassword} disabled={saving} className="btn-primary flex items-center gap-2 text-xs disabled:opacity-60">
                <Lock size={13} /> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {tab === 'pdpl' && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-800">PDPL Consent — Bahrain Personal Data Protection Law 2026</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">What data we collect and why:</p>
                <ul className="space-y-1 text-xs list-disc ml-4">
                  <li>Personal identification (CPR, Passport) — required for LMRA compliance</li>
                  <li>Salary and banking details — required for WPS 2.0 wage transfer</li>
                  <li>Contact information — for employment communication</li>
                  <li>Performance data — for appraisal and promotion purposes</li>
                </ul>
                <p className="mt-3 text-xs">Your data is encrypted at rest, never sold, and only shared with LMRA/SIO as legally required.</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <Shield size={16} className="text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  PDPL Consent: <span className="font-bold">Signed</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
