import clsx from 'clsx';

const employees = [
  { name: 'Alfredo Gouse',  role: 'Project Manager',    status: 'Active',   avatar: 'AG' },
  { name: 'Kianna Culhane', role: 'UX Researcher',      status: 'Active',   avatar: 'KC' },
  { name: 'Talan Dorwart',  role: 'Graphic Designer',   status: 'On Leave', avatar: 'TD' },
  { name: 'Zaire Levin',    role: 'Front-end Developer',status: 'Resigned', avatar: 'ZL' },
];

const statusMap = {
  'Active':   'badge-active',
  'On Leave': 'badge-leave',
  'Resigned': 'badge-resigned',
};

export default function EmployeeStatusTable() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Employee Status</h3>
        <button className="text-xs text-primary font-medium">See All</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-gray-50">
            <th className="text-left pb-2 font-medium">Employee Name</th>
            <th className="text-left pb-2 font-medium">Role</th>
            <th className="text-left pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {employees.map((emp) => (
            <tr key={emp.name} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                    {emp.avatar}
                  </div>
                  <span className="font-medium text-gray-800">{emp.name}</span>
                </div>
              </td>
              <td className="py-2.5 text-gray-500 text-xs">{emp.role}</td>
              <td className="py-2.5">
                <span className={clsx(statusMap[emp.status])}>{emp.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
