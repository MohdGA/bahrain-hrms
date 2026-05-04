import { useState } from 'react';
import { Plus, X, Check, XCircle, Calendar } from 'lucide-react';
import api from '../utils/api';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../store/authStore.jsx';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const statusBadge = { Pending: 'badge-pending', Approved: 'badge-active', Rejected: 'badge-resigned' };
const LEAVE_TYPES = ['Annual','Sick','Hajj','Unpaid','Emergency'];

export default function Schedule() {
  const { user } = useAuth();
  const isManager = ['admin','hr_officer'].includes(user?.role);

  const { data: allLeaves, loading: allLoading, refetch: refetchAll } = useFetch(isManager ? '/leave' : null);
  const { data: myLeaves,  loading: myLoading,  refetch: refetchMy  } = useFetch('/leave/my');

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({ leaveType:'Annual', startDate:'', endDate:'', reason:'' });
  const [tab, setTab]   = useState(isManager ? 'all' : 'my');

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const days = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)
    : 0;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return toast.error('Please select start and end dates');
    setSaving(true);
    try {
      await api.post('/leave', form);
      toast.success('Leave request submitted!');
      setShowModal(false);
      setForm({ leaveType:'Annual', startDate:'', endDate:'', reason:'' });
      refetchMy();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.put(`/leave/${id}/review`, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      refetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave');
    }
  };

  const leaves = tab === 'all' ? allLeaves : myLeaves;
  const loading = tab === 'all' ? allLoading : myLoading;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Annual 30 days • Hajj 14 days (one-time) • Labour Law No. 36 of 2012</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-xs">
          <Plus size={14} /> Apply Leave
        </button>
      </div>

      {/* Leave types info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { type:'Annual',    days:'30 days/year',        color:'bg-blue-50 text-blue-700' },
          { type:'Sick',      days:'15 days/year',        color:'bg-green-50 text-green-700' },
          { type:'Hajj',      days:'14 days (one-time)',  color:'bg-purple-50 text-purple-700' },
          { type:'Unpaid',    days:'Manager approval',    color:'bg-gray-50 text-gray-700' },
        ].map(({ type, days, color }) => (
          <div key={type} className={`rounded-xl p-3 ${color.split(' ')[0]}`}>
            <p className={`text-sm font-semibold ${color.split(' ')[1]}`}>{type} Leave</p>
            <p className={`text-xs mt-0.5 ${color.split(' ')[1]} opacity-80`}>{days}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card">
        {isManager && (
          <div className="flex border-b border-gray-100 mb-4 -mt-1">
            {['all','my'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx('px-4 py-2 text-xs font-medium capitalize border-b-2 transition-colors',
                  tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400')}>
                {t === 'all' ? 'All Requests' : 'My Leaves'}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2"><table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                {tab === 'all' && <th className="text-left pb-2 font-medium">Employee</th>}
                <th className="text-left pb-2 font-medium">Type</th>
                <th className="text-left pb-2 font-medium">From</th>
                <th className="text-left pb-2 font-medium">To</th>
                <th className="text-left pb-2 font-medium">Days</th>
                <th className="text-left pb-2 font-medium">Reason</th>
                <th className="text-left pb-2 font-medium">Status</th>
                {tab === 'all' && isManager && <th className="text-left pb-2 font-medium">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!leaves || leaves.length === 0) && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No leave requests found</td></tr>
              )}
              {leaves?.map(l => (
                <tr key={l._id} className="hover:bg-gray-50/50">
                  {tab === 'all' && (
                    <td className="py-2.5 font-medium text-gray-800 text-xs">
                      {l.employee?.firstName} {l.employee?.lastName}
                      <p className="text-gray-400">{l.employee?.employeeId}</p>
                    </td>
                  )}
                  <td className="py-2.5"><span className="badge-pending">{l.leaveType}</span></td>
                  <td className="py-2.5 text-xs text-gray-600">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="py-2.5 text-xs text-gray-600">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="py-2.5 text-xs font-medium text-gray-800">{l.days}</td>
                  <td className="py-2.5 text-xs text-gray-500 max-w-[150px] truncate">{l.reason || '—'}</td>
                  <td className="py-2.5"><span className={statusBadge[l.status]}>{l.status}</span></td>
                  {tab === 'all' && isManager && (
                    <td className="py-2.5">
                      {l.status === 'Pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleReview(l._id, 'Approved')}
                            className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center hover:bg-green-100">
                            <Check size={13} className="text-green-600" />
                          </button>
                          <button onClick={() => handleReview(l._id, 'Rejected')}
                            className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100">
                            <XCircle size={13} className="text-red-500" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Apply for Leave</h2>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Leave Type</label>
                <select value={form.leaveType} onChange={set('leaveType')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Start Date</label>
                  <input type="date" value={form.startDate} onChange={set('startDate')} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">End Date</label>
                  <input type="date" value={form.endDate} onChange={set('endDate')} required
                    min={form.startDate}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
              {days > 0 && (
                <div className="bg-primary-50 rounded-xl px-4 py-2 text-sm text-primary font-medium flex items-center gap-2">
                  <Calendar size={14} /> {days} day{days !== 1 ? 's' : ''} requested
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Reason (optional)</label>
                <textarea value={form.reason} onChange={set('reason')} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                  placeholder="Brief reason..." />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-xs disabled:opacity-60">
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
