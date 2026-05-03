import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Design',      value: 35, color: '#3B6FE8' },
  { name: 'Development', value: 28, color: '#1A45C4' },
  { name: 'Research',    value: 25, color: '#93B4F5' },
  { name: 'Marketing',   value: 12, color: '#1A1A2E' },
];

export default function DemographicsChart({ total = 450 }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Employee Demographics</h3>
        <button className="text-xs border border-gray-200 px-3 py-1 rounded-lg text-gray-500 hover:bg-gray-50">
          Roles ↓
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                dataKey="value" strokeWidth={0}>
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-gray-900">{total}</span>
            <span className="text-[10px] text-gray-400">Employees</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <div>
                <p className="text-xs text-gray-500">{d.name}</p>
                <p className="text-sm font-semibold text-gray-800">{d.value}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
