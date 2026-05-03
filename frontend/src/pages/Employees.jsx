import { useState } from 'react';
import { Search, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import useFetch from '../hooks/useFetch';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const statusBadge = {
  Active: 'badge-active', 'On Leave': 'badge-leave',
  Resigned: 'badge-resigned', Terminated: 'badge-resigned',
};

const DEPARTMENTS = ['Administration','Engineering','Finance','Human Resources','Marketing','Operations','Sales','IT','Legal','Design'];
const ROLES = ['employee','hr_officer','finance_manager','wrp','admin'];

const empty = {
  firstName:'', lastName:'', firstNameAr:'', lastNameAr:'',
  email:'', phone:'', password:'Admin@1234',
  dateOfBirth:'', gender:'Male', nationality:'', religion:'',
  cprNumber:'', isBahraini:false,
  department:'', designation:'', employmentType:'Full-Time',
  joinDate:'', basicSalary:'', housingAllowance:'0',
  transportAllowance:'0', socialAllowance:'0',
  iban:'', bankName:'',
  workPermitNumber:'', workPermitExpiry:'',
  passportNumber:'', passportExpiry:'', cprExpiry:'',
  role:'employee',
};

// Validate each tab and return { fieldName: 'error message' }
function validateTab(tab, form) {
  const errs = {};
  if (tab === 'personal') {
    if (!form.firstName.trim())    errs.firstName  = 'First name is required';
    if (!form.lastName.trim())     errs.lastName   = 'Last name is required';
    if (!form.email.trim())        errs.email      = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.nationality.trim())  errs.nationality = 'Nationality is required';
    if (!form.cprNumber.trim())    errs.cprNumber  = 'CPR number is required';
    else if (!/^\d{9}$/.test(form.cprNumber)) errs.cprNumber = 'CPR must be exactly 9 digits';
    if (!form.password.trim())     errs.password   = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
  }
  if (tab === 'employment') {
    if (!form.department)   errs.department  = 'Department is required';
    if (!form.designation.trim()) errs.designation = 'Designation is required';
    if (!form.joinDate)     errs.joinDate    = 'Join date is required';
  }
  if (tab === 'salary') {
    if (!form.basicSalary)  errs.basicSalary = 'Basic salary is required';
    else if (isNaN(Number(form.basicSalary)) || Number(form.basicSalary) <= 0)
      errs.basicSalary = 'Enter a valid salary (e.g. 500.000)';
    if (form.iban && !/^BH\d{2}[A-Z0-9]{4}\d{14}$/.test(form.iban))
      errs.iban = 'IBAN must start with BH (e.g. BH29BMAG1299123456BH00)';
  }
  return errs;
}

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder, hasError }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      className={clsx(
        'w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors',
        hasError
          ? 'border-red-300 bg-red-50 focus:ring-red-100'
          : 'border-gray-200 focus:ring-primary-100'
      )}
    />
  );
}

function SelectInput({ value, onChange, options, hasError }) {
  return (
    <select
      value={value} onChange={onChange}
      className={clsx(
        'w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors',
        hasError
          ? 'border-red-300 bg-red-50 focus:ring-red-100'
          : 'border-gray-200 focus:ring-primary-100'
      )}
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

const TABS = ['personal', 'employment', 'salary', 'documents'];
const TAB_LABELS = { personal: 'Personal', employment: 'Employment', salary: 'Salary', documents: 'Documents' };

export default function Employees() {
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(empty);
  const [activeTab, setActiveTab] = useState('personal');
  const [errors, setErrors]       = useState({});
  // Track which tabs have been validated (to show checkmarks)
  const [tabsDone, setTabsDone]   = useState({});

  const { data: employees, loading, refetch } = useFetch('/employees?limit=100');

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    // Clear the error for this field as user types
    if (errors[field]) setErrors(prev => { const n = {...prev}; delete n[field]; return n; });
  };

  const goToTab = (tab) => {
    // Validate current tab before moving forward
    const currentIdx = TABS.indexOf(activeTab);
    const targetIdx  = TABS.indexOf(tab);
    if (targetIdx > currentIdx) {
      const errs = validateTab(activeTab, form);
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setTabsDone(p => ({ ...p, [activeTab]: true }));
      setErrors({});
    }
    setActiveTab(tab);
  };

  const handleNext = () => {
    const errs = validateTab(activeTab, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setTabsDone(p => ({ ...p, [activeTab]: true }));
    setErrors({});
    const next = TABS[TABS.indexOf(activeTab) + 1];
    if (next) setActiveTab(next);
  };

  const handleSubmit = async () => {
    // Validate all required tabs before final submit
    const allErrs = {};
    ['personal','employment','salary'].forEach(t => {
      Object.assign(allErrs, validateTab(t, form));
    });
    if (Object.keys(allErrs).length) {
      // Jump to first tab with errors
      const errTab = ['personal','employment','salary'].find(t => Object.keys(validateTab(t, form)).length);
      setActiveTab(errTab);
      setErrors(validateTab(errTab, form));
      return;
    }
    setSaving(true);
    try {
      await api.post('/employees/register', form);
      toast.success('Employee added successfully!');
      setShowModal(false);
      setForm(empty);
      setErrors({});
      setTabsDone({});
      setActiveTab('personal');
      refetch();
    } catch (err) {
      // Parse backend errors and show them inline
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('email')) {
        setActiveTab('personal');
        setErrors({ email: 'This email is already registered' });
      } else if (msg.toLowerCase().includes('cpr')) {
        setActiveTab('personal');
        setErrors({ cprNumber: 'This CPR number already exists' });
      } else {
        toast.error(msg || 'Failed to add employee');
      }
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(empty);
    setErrors({});
    setTabsDone({});
    setActiveTab('personal');
  };

  const filtered = (employees || []).filter(e => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.department} ${e.employeeId}`
      .toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? e.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">{(employees || []).length} total employees</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-xs">
          <Plus size={14} /> Add Employee
        </button>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <select value={filterStatus} onChange={e => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            <option value="">All Status</option>
            {['Active','On Leave','Resigned','Terminated'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading employees...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-3 font-medium">Employee</th>
                <th className="text-left pb-3 font-medium">ID</th>
                <th className="text-left pb-3 font-medium">Department</th>
                <th className="text-left pb-3 font-medium">Designation</th>
                <th className="text-left pb-3 font-medium">Type</th>
                <th className="text-left pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                  {search ? 'No employees match your search' : 'No employees yet — add your first one!'}
                </td></tr>
              )}
              {filtered.map(emp => (
                <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500 text-xs">{emp.employeeId}</td>
                  <td className="py-3 text-gray-600">{emp.department}</td>
                  <td className="py-3 text-gray-600">{emp.designation}</td>
                  <td className="py-3 text-xs text-gray-500">{emp.employmentType}</td>
                  <td className="py-3"><span className={statusBadge[emp.status]}>{emp.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add Employee Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add New Employee</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              {TABS.map(t => (
                <button key={t} onClick={() => goToTab(t)}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                    activeTab === t
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  )}>
                  {tabsDone[t] && <CheckCircle2 size={12} className="text-green-500" />}
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* ── Personal ── */}
              {activeTab === 'personal' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name (EN)" required error={errors.firstName}>
                    <Input value={form.firstName} onChange={set('firstName')} placeholder="James" hasError={!!errors.firstName} />
                  </Field>
                  <Field label="Last Name (EN)" required error={errors.lastName}>
                    <Input value={form.lastName} onChange={set('lastName')} placeholder="Franklyn" hasError={!!errors.lastName} />
                  </Field>
                  <Field label="الاسم الأول">
                    <Input value={form.firstNameAr} onChange={set('firstNameAr')} placeholder="جيمس" />
                  </Field>
                  <Field label="اسم العائلة">
                    <Input value={form.lastNameAr} onChange={set('lastNameAr')} placeholder="فرانكلين" />
                  </Field>
                  <Field label="Email" required error={errors.email}>
                    <Input type="email" value={form.email} onChange={set('email')} placeholder="james@company.com" hasError={!!errors.email} />
                  </Field>
                  <Field label="Phone">
                    <Input value={form.phone} onChange={set('phone')} placeholder="+973 3X XX XXXX" />
                  </Field>
                  <Field label="Date of Birth">
                    <Input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                  </Field>
                  <Field label="Gender">
                    <SelectInput value={form.gender} onChange={set('gender')} options={['Male','Female']} />
                  </Field>
                  <Field label="Nationality" required error={errors.nationality}>
                    <Input value={form.nationality} onChange={set('nationality')} placeholder="Bahraini / Indian / ..." hasError={!!errors.nationality} />
                  </Field>
                  <Field label="Religion">
                    <Input value={form.religion} onChange={set('religion')} placeholder="Muslim / Christian / ..." />
                  </Field>
                  <Field label="CPR Number" required error={errors.cprNumber}>
                    <Input value={form.cprNumber} onChange={set('cprNumber')} placeholder="900000001 (9 digits)" hasError={!!errors.cprNumber} />
                  </Field>
                  <Field label="Is Bahraini National?">
                    <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                      <input type="checkbox" checked={form.isBahraini} onChange={set('isBahraini')}
                        className="w-4 h-4 accent-primary rounded" />
                      <span className="text-sm text-gray-700">Yes, Bahraini national</span>
                    </label>
                  </Field>
                  <Field label="Password" required error={errors.password}>
                    <Input type="password" value={form.password} onChange={set('password')} placeholder="Temporary password" hasError={!!errors.password} />
                  </Field>
                  <Field label="Role">
                    <SelectInput value={form.role} onChange={set('role')} options={ROLES} />
                  </Field>
                </div>
              )}

              {/* ── Employment ── */}
              {activeTab === 'employment' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Department" required error={errors.department}>
                    <SelectInput value={form.department} onChange={set('department')} options={DEPARTMENTS} hasError={!!errors.department} />
                  </Field>
                  <Field label="Designation" required error={errors.designation}>
                    <Input value={form.designation} onChange={set('designation')} placeholder="e.g. Software Engineer" hasError={!!errors.designation} />
                  </Field>
                  <Field label="Employment Type">
                    <SelectInput value={form.employmentType} onChange={set('employmentType')} options={['Full-Time','Part-Time','Contract']} />
                  </Field>
                  <Field label="Join Date" required error={errors.joinDate}>
                    <Input type="date" value={form.joinDate} onChange={set('joinDate')} hasError={!!errors.joinDate} />
                  </Field>
                </div>
              )}

              {/* ── Salary ── */}
              {activeTab === 'salary' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Basic Salary (BHD)" required error={errors.basicSalary}>
                    <Input value={form.basicSalary} onChange={set('basicSalary')} placeholder="500.000" hasError={!!errors.basicSalary} />
                  </Field>
                  <Field label="Housing Allowance (BHD)">
                    <Input value={form.housingAllowance} onChange={set('housingAllowance')} placeholder="0.000" />
                  </Field>
                  <Field label="Transport Allowance (BHD)">
                    <Input value={form.transportAllowance} onChange={set('transportAllowance')} placeholder="0.000" />
                  </Field>
                  <Field label="Social Allowance (BHD)">
                    <Input value={form.socialAllowance} onChange={set('socialAllowance')} placeholder="0.000" />
                  </Field>
                  <Field label="IBAN (BH format)" error={errors.iban}>
                    <Input value={form.iban} onChange={set('iban')} placeholder="BH29BMAG1299123456BH00" hasError={!!errors.iban} />
                  </Field>
                  <Field label="Bank Name">
                    <Input value={form.bankName} onChange={set('bankName')} placeholder="Bank of Bahrain and Kuwait" />
                  </Field>
                </div>
              )}

              {/* ── Documents ── */}
              {activeTab === 'documents' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="CPR Expiry">
                    <Input type="date" value={form.cprExpiry} onChange={set('cprExpiry')} />
                  </Field>
                  <Field label="Passport Number">
                    <Input value={form.passportNumber} onChange={set('passportNumber')} placeholder="A12345678" />
                  </Field>
                  <Field label="Passport Expiry">
                    <Input type="date" value={form.passportExpiry} onChange={set('passportExpiry')} />
                  </Field>
                  <Field label="Work Permit Number">
                    <Input value={form.workPermitNumber} onChange={set('workPermitNumber')} placeholder="WP-2026-XXXXX" />
                  </Field>
                  <Field label="Work Permit Expiry">
                    <Input type="date" value={form.workPermitExpiry} onChange={set('workPermitExpiry')} />
                  </Field>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              {/* Step dots */}
              <div className="flex gap-1.5">
                {TABS.map(t => (
                  <button key={t} onClick={() => goToTab(t)}
                    className={clsx('h-2 rounded-full transition-all', activeTab === t ? 'w-5 bg-primary' : tabsDone[t] ? 'w-2 bg-green-400' : 'w-2 bg-gray-200')} />
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={closeModal} className="btn-outline text-xs">Cancel</button>
                {activeTab !== 'documents' ? (
                  <button type="button" onClick={handleNext} className="btn-primary text-xs">
                    Next →
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={saving}
                    className="btn-primary text-xs disabled:opacity-60 min-w-[110px]">
                    {saving ? 'Saving...' : 'Add Employee'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
