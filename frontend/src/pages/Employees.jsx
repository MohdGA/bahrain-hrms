import { useState } from 'react';
import { Search, Plus, Filter, X, ChevronDown } from 'lucide-react';
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

function Field({ label, children, required }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type='text', placeholder, required }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100" />
  );
}

function Select({ value, onChange, options, required }) {
  return (
    <select value={value} onChange={onChange} required={required}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100">
      <option value="">Select...</option>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  );
}

export default function Employees() {
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState(empty);
  const [activeTab, setActiveTab]   = useState('personal');

  const { data: employees, loading, refetch } = useFetch('/employees?limit=100');

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/employees/register', form);
      toast.success('Employee added successfully!');
      setShowModal(false);
      setForm(empty);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setSaving(false);
    }
  };

  const filtered = (employees || []).filter(e => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.department} ${e.employeeId}`
      .toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? e.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const tabs = ['personal','employment','salary','documents'];

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

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add New Employee</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={clsx('px-4 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors',
                    activeTab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600')}>
                  {t}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name (EN)" required><Input value={form.firstName} onChange={set('firstName')} placeholder="James" required /></Field>
                  <Field label="Last Name (EN)" required><Input value={form.lastName} onChange={set('lastName')} placeholder="Franklyn" required /></Field>
                  <Field label="الاسم الأول"><Input value={form.firstNameAr} onChange={set('firstNameAr')} placeholder="جيمس" /></Field>
                  <Field label="اسم العائلة"><Input value={form.lastNameAr} onChange={set('lastNameAr')} placeholder="فرانكلين" /></Field>
                  <Field label="Email" required><Input type="email" value={form.email} onChange={set('email')} placeholder="james@company.com" required /></Field>
                  <Field label="Phone"><Input value={form.phone} onChange={set('phone')} placeholder="+973 3X XX XXXX" /></Field>
                  <Field label="Date of Birth"><Input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></Field>
                  <Field label="Gender">
                    <Select value={form.gender} onChange={set('gender')} options={['Male','Female']} />
                  </Field>
                  <Field label="Nationality" required><Input value={form.nationality} onChange={set('nationality')} placeholder="Bahraini / Indian / ..." required /></Field>
                  <Field label="Religion"><Input value={form.religion} onChange={set('religion')} placeholder="Muslim / Christian / ..." /></Field>
                  <Field label="CPR Number" required>
                    <Input value={form.cprNumber} onChange={set('cprNumber')} placeholder="900000001 (9 digits)" required />
                  </Field>
                  <Field label="Is Bahraini?">
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input type="checkbox" checked={form.isBahraini} onChange={set('isBahraini')} className="rounded" />
                      <span className="text-sm text-gray-700">Yes, Bahraini national</span>
                    </label>
                  </Field>
                  <Field label="Password" required>
                    <Input type="password" value={form.password} onChange={set('password')} placeholder="Temp password" required />
                  </Field>
                  <Field label="Role">
                    <Select value={form.role} onChange={set('role')} options={ROLES} />
                  </Field>
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Department" required>
                    <Select value={form.department} onChange={set('department')} options={DEPARTMENTS} required />
                  </Field>
                  <Field label="Designation" required><Input value={form.designation} onChange={set('designation')} placeholder="Software Engineer" required /></Field>
                  <Field label="Employment Type">
                    <Select value={form.employmentType} onChange={set('employmentType')} options={['Full-Time','Part-Time','Contract']} />
                  </Field>
                  <Field label="Join Date" required><Input type="date" value={form.joinDate} onChange={set('joinDate')} required /></Field>
                </div>
              )}

              {activeTab === 'salary' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Basic Salary (BHD)" required>
                    <Input value={form.basicSalary} onChange={set('basicSalary')} placeholder="500.000" required />
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
                  <Field label="IBAN (BH format)">
                    <Input value={form.iban} onChange={set('iban')} placeholder="BH29BMAG1299123456BH00" />
                  </Field>
                  <Field label="Bank Name">
                    <Input value={form.bankName} onChange={set('bankName')} placeholder="Bank of Bahrain and Kuwait" />
                  </Field>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="CPR Expiry"><Input type="date" value={form.cprExpiry} onChange={set('cprExpiry')} /></Field>
                  <Field label="Passport Number"><Input value={form.passportNumber} onChange={set('passportNumber')} placeholder="A12345678" /></Field>
                  <Field label="Passport Expiry"><Input type="date" value={form.passportExpiry} onChange={set('passportExpiry')} /></Field>
                  <Field label="Work Permit Number"><Input value={form.workPermitNumber} onChange={set('workPermitNumber')} placeholder="WP-2026-XXXXX" /></Field>
                  <Field label="Work Permit Expiry"><Input type="date" value={form.workPermitExpiry} onChange={set('workPermitExpiry')} /></Field>
                </div>
              )}
            </form>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="flex gap-2">
                {tabs.map((t, i) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={clsx('w-2 h-2 rounded-full transition-all', activeTab === t ? 'bg-primary w-4' : 'bg-gray-200')} />
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline text-xs">Cancel</button>
                {activeTab !== 'documents' ? (
                  <button type="button" onClick={() => setActiveTab(tabs[tabs.indexOf(activeTab)+1])} className="btn-primary text-xs">Next →</button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={saving} className="btn-primary text-xs disabled:opacity-60">
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
