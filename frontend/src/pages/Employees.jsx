import { useState, useEffect } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import api from '../utils/api';
import clsx from 'clsx';

const statusBadge = { Active: 'badge-active', 'On Leave': 'badge-leave', Resigned: 'badge-resigned', Terminated: 'badge-resigned' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    api.get('/employees').then(r => setEmployees(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.department}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">{employees.length} total employees</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-xs">
          <Plus size={14} /> Add Employee
        </button>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <button className="btn-outline flex items-center gap-2 text-xs"><Filter size={13} /> Filter</button>
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
                <th className="text-left pb-3 font-medium">Nationality</th>
                <th className="text-left pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => (
                <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold">
                        {emp.firstName[0]}{emp.lastName[0]}
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
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${emp.isBahraini ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {emp.isBahraini ? '🇧🇭 Bahraini' : emp.nationality}
                    </span>
                  </td>
                  <td className="py-3"><span className={statusBadge[emp.status]}>{emp.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No employees found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
