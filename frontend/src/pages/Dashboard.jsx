import { Users, UserCheck, UserMinus, Download, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useFetch from '../hooks/useFetch';
import clsx from 'clsx';

const COLORS = ['#3B6FE8', '#1A45C4', '#93B4F5', '#1A1A2E', '#60A5FA', '#A78BFA'];

const statusBadge = {
  Active:     'badge-active',
  'On Leave': 'badge-leave',
  Resigned:   'badge-resigned',
  Terminated: 'badge-resigned',
};

function StatCard({ icon: Icon, label, value, change }) {
  const up = change >= 0;
  return (
    <div className="card flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
        <Icon size={20} className="text-primary" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-end gap-2 mt-0.5">
          <span className="text-2xl font-bold text-gray-900">{value ?? '—'}</span>
          {change !== null && change !== undefined && (
            <span className={clsx('text-xs font-medium mb-1', up ? 'text-green-600' : 'text-red-500')}>
              {up ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = 'h-6 w-24' }) {
  return <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} />;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: stats, loading: statsLoading }   = useFetch('/dashboard/stats');
  const { data: recent, loading: recentLoading } = useFetch('/dashboard/recent-employees');
  const { data: expiry, loading: expiryLoading } = useFetch('/dashboard/expiry-radar');

  const s = stats;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live snapshot of your HR operations</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2 text-xs">
            <Calendar size={13} /> {t('thisMonth')}
          </button>
          <button className="btn-primary flex items-center gap-2 text-xs">
            <Download size={13} /> {t('export')}
          </button>
        </div>
      </div>

      {/* Row 1: Stats + Demographics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          [1,2,3].map(i => <div key={i} className="card"><Skeleton className="h-20 w-full" /></div>)
        ) : (
          <>
            <StatCard icon={Users}     label={t('totalEmployees')}     value={s?.totalEmployees?.value}    change={s?.totalEmployees?.change} />
            <StatCard icon={UserCheck} label={t('newEmployees')}       value={s?.newEmployees?.value}      change={s?.newEmployees?.change} />
            <StatCard icon={UserMinus} label={t('resignedEmployees')}  value={s?.resignedEmployees?.value} change={s?.resignedEmployees?.change} />
          </>
        )}

        {/* Demographics */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">{t('employeeDemographics')}</h3>
          </div>
          {statsLoading ? <Skeleton className="h-28 w-full" /> : (
            <div className="flex items-center gap-3">
              <div className="relative w-24 h-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={s?.demographics || []} cx="50%" cy="50%" innerRadius={28} outerRadius={42} dataKey="value" strokeWidth={0}>
                      {(s?.demographics || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => [`${p.payload.count} employees`, p.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-gray-900">{s?.totalEmployees?.value}</span>
                  <span className="text-[9px] text-gray-400">Total</span>
                </div>
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                {(s?.demographics || []).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-gray-500 truncate">{d.name}</span>
                    <span className="text-[10px] font-semibold text-gray-700 ml-auto">{d.value}%</span>
                  </div>
                ))}
                {(!s?.demographics?.length) && <p className="text-xs text-gray-400">No data yet</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Bahrainisation + Expiry Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bahrainisation */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3">Bahrainisation Quota</h3>
          {statsLoading ? <Skeleton className="h-16 w-full" /> : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Bahraini Staff</span>
                <span className="text-sm font-bold text-primary">{s?.bahrainisationRate ?? 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                <div className="bg-primary h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(s?.bahrainisationRate ?? 0, 100)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-blue-700">{s?.bahrainis ?? 0}</p>
                  <p className="text-xs text-blue-500">🇧🇭 Bahraini</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-700">{s?.expats ?? 0}</p>
                  <p className="text-xs text-gray-500">Expat</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Document Expiry Radar */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Document Expiry Radar</h3>
            {!expiryLoading && <span className="badge-pending">{expiry?.length ?? 0} alerts</span>}
          </div>
          {expiryLoading ? <Skeleton className="h-28 w-full" /> : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {expiry?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No expiring documents</p>}
              {expiry?.map(doc => {
                const days = Math.ceil((new Date(doc.expiryDate) - new Date()) / 86400000);
                return (
                  <div key={doc._id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        {doc.employee?.firstName} {doc.employee?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400">{doc.documentType} — {doc.employee?.employeeId}</p>
                    </div>
                    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
                      days <= 0 ? 'bg-red-100 text-red-700' :
                      days <= 15 ? 'bg-red-100 text-red-600' :
                      days <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-yellow-50 text-yellow-700')}>
                      {days <= 0 ? 'Expired' : `${days}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Recent Employees + Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Employees</h3>
          <a href="/employees" className="text-xs text-primary font-medium">{t('seeAll')}</a>
        </div>
        {recentLoading ? <Skeleton className="h-32 w-full" /> : (
          <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">Employee</th>
                <th className="text-left pb-2 font-medium">Department</th>
                <th className="text-left pb-2 font-medium">Designation</th>
                <th className="text-left pb-2 font-medium">Join Date</th>
                <th className="text-left pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent?.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No employees yet. Add your first employee!</td></tr>
              )}
              {recent?.map(emp => (
                <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-xs">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] text-gray-400">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-xs text-gray-600">{emp.department}</td>
                  <td className="py-2.5 text-xs text-gray-600">{emp.designation}</td>
                  <td className="py-2.5 text-xs text-gray-500">{new Date(emp.joinDate).toLocaleDateString()}</td>
                  <td className="py-2.5"><span className={statusBadge[emp.status]}>{emp.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
