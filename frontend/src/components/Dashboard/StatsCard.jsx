import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export default function StatsCard({ icon: Icon, label, value, change, changeType = 'up' }) {
  const isUp = changeType === 'up';
  return (
    <div className="card flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
        <Icon size={20} className="text-primary" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-end gap-2 mt-0.5">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {change && (
            <span className={clsx('flex items-center gap-0.5 text-xs font-medium mb-1',
              isUp ? 'text-green-600' : 'text-red-500')}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
