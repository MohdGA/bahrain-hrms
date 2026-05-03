import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Aug', senior: 60, mid: 25, junior: 15 },
  { month: 'Sep', senior: 65, mid: 20, junior: 15 },
  { month: 'Oct', senior: 70, mid: 20, junior: 10 },
  { month: 'Nov', senior: 75, mid: 15, junior: 10 },
  { month: 'Dec', senior: 80, mid: 12, junior: 8  },
  { month: 'Jan', senior: 72, mid: 18, junior: 10 },
  { month: 'Feb', senior: 68, mid: 22, junior: 10 },
  { month: 'Mar', senior: 74, mid: 16, junior: 10 },
  { month: 'Apr', senior: 78, mid: 14, junior: 8  },
  { month: 'May', senior: 82, mid: 12, junior: 6  },
  { month: 'Jun', senior: 85, mid: 10, junior: 5  },
  { month: 'Jul', senior: 88, mid: 8,  junior: 4  },
  { month: 'Aug', senior: 90, mid: 7,  junior: 3  },
];

export default function TeamPerformanceChart() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Team Performance Analytics</h3>
        <div className="flex gap-2">
          <button className="text-xs border border-gray-200 px-3 py-1 rounded-lg text-gray-500 hover:bg-gray-50">All Roles ↓</button>
          <button className="text-xs border border-gray-200 px-3 py-1 rounded-lg text-gray-500 hover:bg-gray-50">Aug 2025 – Aug 2026 ↓</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={14} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="senior" stackId="a" fill="#1A45C4" radius={[0,0,0,0]} />
          <Bar dataKey="mid"    stackId="a" fill="#3B6FE8" />
          <Bar dataKey="junior" stackId="a" fill="#93B4F5" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
