import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import useFetch from '../hooks/useFetch';

const COLORS = ['#3B6FE8','#1A45C4','#93B4F5','#1A1A2E','#60A5FA','#A78BFA','#34D399','#F59E0B'];

function Skeleton({ h = 'h-40' }) {
  return <div className={`bg-gray-100 animate-pulse rounded-xl ${h}`} />;
}

export default function Analytics() {
  const { data: stats, loading } = useFetch('/dashboard/stats');
  const { data: employees }      = useFetch('/employees?limit=200');

  const deptData = stats?.demographics || [];

  const statusData = stats?.statusBreakdown
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const nationalityMap = {};
  (employees || []).forEach(e => {
    nationalityMap[e.nationality] = (nationalityMap[e.nationality] || 0) + 1;
  });
  const nationalityData = Object.entries(nationalityMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time workforce insights</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Active',      value: stats?.totalEmployees?.value ?? '—',      color:'text-primary' },
          { label:'Bahraini Staff',     value: stats?.bahrainis ?? '—',                  color:'text-blue-600' },
          { label:'Expat Staff',        value: stats?.expats ?? '—',                     color:'text-purple-600' },
          { label:'Bahrainisation %',   value: stats ? `${stats.bahrainisationRate}%` : '—', color:'text-green-600' },
        ].map(k => (
          <div key={k.label} className="card text-center">
            {loading ? <div className="h-8 bg-gray-100 animate-pulse rounded-lg" /> : (
              <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Department breakdown */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Staff by Department</h3>
          {loading ? <Skeleton /> : deptData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize:11, fill:'#6B7280' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v, n, p) => [`${p.payload.count} employees (${v}%)`]} />
                <Bar dataKey="value" fill="#3B6FE8" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status breakdown */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Status Breakdown</h3>
          {loading ? <Skeleton /> : statusData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`} labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Nationality breakdown */}
        <div className="card col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Staff by Nationality</h3>
          {!employees ? <Skeleton /> : nationalityData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={nationalityData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" name="Employees" fill="#3B6FE8" radius={[4,4,0,0]}>
                  {nationalityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
