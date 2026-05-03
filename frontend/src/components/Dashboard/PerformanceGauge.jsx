import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Zap, ChevronRight } from 'lucide-react';

const gaugeData = [{ value: 86, fill: '#3B6FE8' }, { value: 100, fill: '#EEF2FD' }];

export default function PerformanceGauge({ score = 86, lastMonth = 75 }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">Average Performances</h3>
        <button className="text-xs text-primary font-medium">See All</button>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-24 overflow-hidden">
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart cx="50%" cy="100%" innerRadius="60%" outerRadius="100%"
              startAngle={180} endAngle={0} data={[{ value: score, fill: '#3B6FE8' }]}>
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#EEF2FD' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <p className="text-3xl font-bold text-gray-900">{score}</p>
            <p className="text-xs text-gray-400">Total Score</p>
          </div>
        </div>
        <div className="mt-4 w-full flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-800">{lastMonth}</p>
              <p className="text-xs text-gray-400">Total score in the last month</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
