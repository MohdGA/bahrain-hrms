import { Calendar, MoreVertical } from 'lucide-react';
import clsx from 'clsx';

const interviews = [
  { id: 1, name: 'Jakob Workman',  email: 'jakobskuy@gmail.com',       date: 'June, 14',  time: '9:00 AM',  status: 'Confirmed',    avatar: 'JW' },
  { id: 2, name: 'Justin Levin',   email: 'justindesign@gmail.com',    date: 'June, 15',  time: '10:30 AM', status: 'Re-scheduled',  avatar: 'JL' },
  { id: 3, name: 'Sarah Al Rashid',email: 'sarah.rashid@gmail.com',    date: 'June, 16',  time: '11:00 AM', status: 'Confirmed',    avatar: 'SR' },
];

const statusStyles = {
  Confirmed:     'bg-green-100 text-green-700',
  'Re-scheduled':'bg-amber-100 text-amber-700',
  Cancelled:     'bg-red-100 text-red-600',
};

export default function UpcomingInterviews() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Upcoming Interview</h3>
        <button className="text-xs border border-gray-200 px-3 py-1 rounded-lg text-gray-500 hover:bg-gray-50">
          Filter ↓
        </button>
      </div>
      <div className="space-y-3">
        {interviews.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {item.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-400 truncate">{item.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={11} className="text-gray-400" />
                <span className="text-xs text-gray-500">{item.date} • {item.time}</span>
                <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', statusStyles[item.status])}>
                  {item.status}
                </span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
