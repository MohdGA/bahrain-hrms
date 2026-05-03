import { useState, useEffect } from 'react';
import { Save, Building2, Clock, Bell, Shield, Sun } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../store/authStore.jsx';
import toast from 'react-hot-toast';

const TABS = [
  { key:'company',  label:'Company',       icon: Building2 },
  { key:'payroll',  label:'Payroll & WPS',  icon: Clock },
  { key:'notify',   label:'Notifications', icon: Bell },
  { key:'security', label:'Security',      icon: Shield },
];

function SectionTitle({ children }) {
  return <h3 className="text-sm font-semibold text-gray-700 mt-2 mb-3 pb-2 border-b border-gray-100">{children}</h3>;
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';
  const [tab, setTab]       = useState('company');
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    companyName:'', companyNameAr:'', crNumber:'', industry:'', address:'', phone:'', email:'',
    ramadanMode: false, ramadanYear: new Date().getFullYear(),
    workingHours: { normal: 8, ramadan: 6, perWeek: 48 },
    payrollCutoff: 25, wpsDeadlineDay: 10, currency:'BHD', timezone:'Asia/Bahrain',
    notifications: { documentExpiry: true, payrollReminder: true, leaveApproval: true },
  });

  useEffect(() => {
    api.get('/settings').then(r => {
      const d = r.data.data;
      setForm(f => ({ ...f, ...d }));
    }).catch(() => {});
  }, []);

  const set = (field) => (e) => {
    const val = e.target?.type === 'checkbox' ? e.target.checked : e.target?.value ?? e;
    setForm(p => ({ ...p, [field]: val }));
  };

  const setNested = (parent, field) => (val) =>
    setForm(p => ({ ...p, [parent]: { ...p[parent], [field]: typeof val === 'object' ? val.target.value : val } }));

  const handleSave = async () => {
    if (!isAdmin) return toast.error('Only admin can change settings');
    setSaving(true);
    try {
      await api.put('/settings', form);
      toast.success('Settings saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const input = (field, placeholder, type='text') => (
    <input type={type} value={form[field] || ''} onChange={set(field)} placeholder={placeholder} disabled={!isAdmin}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-400" />
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your HRMS for Bahrain compliance</p>
        </div>
        {isAdmin && (
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-xs disabled:opacity-60">
            <Save size={13} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          Settings can only be modified by an Administrator.
        </div>
      )}

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

        {/* Content */}
        <div className="flex-1 card">
          {tab === 'company' && (
            <>
              <SectionTitle>Company Information</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Company Name (EN)</label>
                  {input('companyName','e.g. Al Mansoori Trading')}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">اسم الشركة (AR)</label>
                  {input('companyNameAr','المنصوري للتجارة')}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">CR Number</label>
                  {input('crNumber','12345-1')}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Industry</label>
                  {input('industry','Information Technology')}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                  {input('phone','+973 1X XX XXXX')}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">HR Email</label>
                  {input('email','hr@company.bh','email')}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Address</label>
                  {input('address','Building 123, Road 456, Block 789, Manama, Bahrain')}
                </div>
              </div>
            </>
          )}

          {tab === 'payroll' && (
            <>
              <SectionTitle>Payroll Configuration</SectionTitle>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Payroll Cutoff Day</label>
                  <input type="number" min={1} max={31} value={form.payrollCutoff} onChange={set('payrollCutoff')} disabled={!isAdmin}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50" />
                  <p className="text-xs text-gray-400 mt-1">Payroll is processed on day {form.payrollCutoff} each month</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">WPS Submission Deadline</label>
                  <input type="number" min={1} max={31} value={form.wpsDeadlineDay} onChange={set('wpsDeadlineDay')} disabled={!isAdmin}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50" />
                  <p className="text-xs text-gray-400 mt-1">SIF file must be submitted by day {form.wpsDeadlineDay}</p>
                </div>
              </div>

              <SectionTitle>Working Hours</SectionTitle>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Normal Hours/Day</label>
                  <input type="number" value={form.workingHours?.normal || 8} onChange={setNested('workingHours','normal')} disabled={!isAdmin}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Ramadan Hours/Day</label>
                  <input type="number" value={form.workingHours?.ramadan || 6} onChange={setNested('workingHours','ramadan')} disabled={!isAdmin}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50" />
                  <p className="text-xs text-gray-400 mt-1">Labour Law max 6hrs/day</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Hours per Week</label>
                  <input type="number" value={form.workingHours?.perWeek || 48} onChange={setNested('workingHours','perWeek')} disabled={!isAdmin}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50" />
                </div>
              </div>

              <SectionTitle>Ramadan Mode</SectionTitle>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Sun size={20} className="text-amber-600" />
                  <p className="font-medium text-amber-800">Ramadan Mode</p>
                </div>
                <p className="text-xs text-amber-700 mb-3">
                  Enabling this caps daily working hours to <strong>6 hours</strong> (36/week) and adjusts
                  overtime rates: Day +25%, Night +50% based on reduced base.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Enable for {form.ramadanYear}</p>
                    <p className="text-xs text-gray-500">Affects overtime calculations company-wide</p>
                  </div>
                  <button onClick={() => isAdmin && set('ramadanMode')(!form.ramadanMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${form.ramadanMode ? 'bg-amber-500' : 'bg-gray-200'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.ramadanMode ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
                {form.ramadanMode && (
                  <div className="mt-3 bg-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800 font-medium">
                    ✅ Ramadan Mode is ACTIVE — All overtime calculations use reduced-hour base
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'notify' && (
            <>
              <SectionTitle>Notification Preferences</SectionTitle>
              <Toggle
                checked={form.notifications?.documentExpiry ?? true}
                onChange={v => isAdmin && setForm(p => ({ ...p, notifications: { ...p.notifications, documentExpiry: v } }))}
                label="Document Expiry Alerts"
                description="Send alerts 60, 30, and 15 days before CPR / Passport / Work Permit expiry"
              />
              <Toggle
                checked={form.notifications?.payrollReminder ?? true}
                onChange={v => isAdmin && setForm(p => ({ ...p, notifications: { ...p.notifications, payrollReminder: v } }))}
                label="Payroll Processing Reminder"
                description={`Remind HR on day ${form.payrollCutoff - 3} to process payroll`}
              />
              <Toggle
                checked={form.notifications?.leaveApproval ?? true}
                onChange={v => isAdmin && setForm(p => ({ ...p, notifications: { ...p.notifications, leaveApproval: v } }))}
                label="Leave Approval Notifications"
                description="Notify managers of pending leave requests"
              />
            </>
          )}

          {tab === 'security' && (
            <>
              <SectionTitle>PDPL 2026 Compliance</SectionTitle>
              <div className="space-y-3">
                {[
                  { label:'Field-Level Encryption',  desc:'CPR, Salary, and Address are encrypted at rest (AES-256)', status: true },
                  { label:'Audit Logging',            desc:'All Read/Edit events on employee data are logged', status: true },
                  { label:'JWT Authentication',       desc:'Session tokens expire after 7 days', status: true },
                  { label:'Rate Limiting',            desc:'API limited to 200 requests per 15 minutes', status: true },
                  { label:'PDPL Consent Tracking',    desc:'Employee consent forms tracked on first login', status: true },
                  { label:'Data Residency',           desc:'Database hosted in AWS MongoDB Atlas', status: true },
                ].map(({ label, desc, status }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {status ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
