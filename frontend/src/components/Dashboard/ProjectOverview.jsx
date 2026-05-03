import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

const items = [
  { icon: FileText,    label: 'Total Projects',    value: 108, color: 'text-blue-500',  bg: 'bg-blue-50'  },
  { icon: CheckCircle, label: 'Project Completed', value: 50,  color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Clock,       label: 'Project Ongoing',   value: 45,  color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: XCircle,     label: 'Project Cancelled', value: 13,  color: 'text-red-400',   bg: 'bg-red-50'   },
];

export default function ProjectOverview() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Project Overview</h3>
        <button className="text-xs text-primary font-medium">See All</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-3`}>
            <Icon size={18} className={color} />
            <p className="text-xl font-bold text-gray-900 mt-2">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
