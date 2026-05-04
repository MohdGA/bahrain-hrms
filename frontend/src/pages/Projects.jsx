import { useState } from 'react';
import { Plus, X, Calendar, Users, TrendingUp, FolderKanban, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';
import useFetch from '../hooks/useFetch';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_COLORS = {
  Planning:  'bg-gray-100 text-gray-700',
  Active:    'bg-blue-100 text-blue-700',
  'On Hold': 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
};
const PRIORITY_COLORS = {
  Low:      'bg-gray-50 text-gray-500',
  Medium:   'bg-blue-50 text-blue-600',
  High:     'bg-orange-50 text-orange-600',
  Critical: 'bg-red-50 text-red-600',
};

const empty = { title:'', description:'', client:'', status:'Planning', priority:'Medium', startDate:'', deadline:'', budget:'', team:[], tags:'' };

export default function Projects() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(empty);
  const [filterStatus, setFilter] = useState('');

  const { data: stats,    refetch: refetchStats    } = useFetch('/projects/stats');
  const { data: projects, refetch: refetchProjects } = useFetch('/projects');
  const { data: employees } = useFetch('/employees?limit=200&status=Active');

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const openCreate = () => { setForm(empty); setEditItem(null); setShowModal(true); };
  const openEdit   = (p) => { setForm({ ...p, team: p.team?.map(m => m._id || m) || [], tags: p.tags?.join(', ') || '' }); setEditItem(p); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Project title is required');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      editItem ? await api.put(`/projects/${editItem._id}`, payload) : await api.post('/projects', payload);
      toast.success(editItem ? 'Project updated!' : 'Project created!');
      setShowModal(false); refetchProjects(); refetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await api.delete(`/projects/${id}`); toast.success('Deleted'); refetchProjects(); refetchStats(); }
    catch { toast.error('Failed to delete'); }
  };

  const updateProgress = async (id, progress) => {
    try { await api.put(`/projects/${id}`, { progress: Number(progress) }); refetchProjects(); }
    catch { toast.error('Failed'); }
  };

  const toggleTeam = (empId) => setForm(p => ({
    ...p,
    team: p.team.includes(empId) ? p.team.filter(id => id !== empId) : [...p.team, empId]
  }));

  const filtered = (projects || []).filter(p => !filterStatus || p.status === filterStatus);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all company projects</p>
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={e => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            <option value="">All Status</option>
            {['Planning','Active','On Hold','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={openCreate} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus size={13} /> New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:'Total',     value: stats?.total,     color:'bg-gray-700' },
          { label:'Active',    value: stats?.active,    color:'bg-blue-500' },
          { label:'Completed', value: stats?.completed, color:'bg-green-500' },
          { label:'On Hold',   value: stats?.onHold,    color:'bg-amber-500' },
          { label:'Cancelled', value: stats?.cancelled, color:'bg-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <p className={`text-2xl font-bold ${color.replace('bg-','text-')}`}>{value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(!filtered || filtered.length === 0) && (
          <div className="col-span-3 card text-center py-12 text-gray-400">
            <FolderKanban size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No projects yet. Create your first project!</p>
          </div>
        )}
        {filtered.map(p => (
          <div key={p._id} className="card hover:shadow-md transition-shadow group">
            {/* Card header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                {p.client && <p className="text-xs text-gray-400">Client: {p.client}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button onClick={() => openEdit(p)} className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-primary-50 text-gray-400 hover:text-primary">
                  <Edit2 size={11} />
                </button>
                <button onClick={() => handleDelete(p._id)} className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[p.status])}>{p.status}</span>
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', PRIORITY_COLORS[p.priority])}>{p.priority}</span>
            </div>

            {p.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>}

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-semibold text-primary">{p.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
              {/* Quick progress update */}
              <input type="range" min={0} max={100} value={p.progress}
                onChange={e => updateProgress(p._id, e.target.value)}
                className="w-full mt-1 accent-primary h-1 cursor-pointer" />
            </div>

            {/* Dates */}
            {(p.startDate || p.deadline) && (
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <Calendar size={11} />
                {p.startDate && <span>{new Date(p.startDate).toLocaleDateString()}</span>}
                {p.deadline && <><span>→</span><span className={clsx(new Date(p.deadline) < new Date() && p.status !== 'Completed' ? 'text-red-500 font-medium' : '')}>
                  {new Date(p.deadline).toLocaleDateString()}
                </span></>}
              </div>
            )}

            {/* Team avatars */}
            {p.team && p.team.length > 0 && (
              <div className="flex items-center gap-1">
                <Users size={11} className="text-gray-400" />
                <div className="flex -space-x-1.5">
                  {p.team.slice(0, 5).map((m, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-primary-50 border-2 border-white flex items-center justify-center text-primary text-[8px] font-bold">
                      {m.firstName?.[0]}{m.lastName?.[0]}
                    </div>
                  ))}
                  {p.team.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-[8px] font-bold">
                      +{p.team.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {p.tags?.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2">
                {p.tags.map(t => (
                  <span key={t} className="text-[10px] bg-primary-50 text-primary px-1.5 py-0.5 rounded-md">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editItem ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Project Title *</label>
                  <input value={form.title} onChange={set('title')} placeholder="e.g. HR System Upgrade"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Client</label>
                  <input value={form.client} onChange={set('client')} placeholder="Client or internal"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Budget (BHD)</label>
                  <input value={form.budget} onChange={set('budget')} placeholder="5000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
                  <select value={form.status} onChange={set('status')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {['Planning','Active','On Hold','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Priority</label>
                  <select value={form.priority} onChange={set('priority')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Start Date</label>
                  <input type="date" value={form.startDate?.slice?.(0,10) || ''} onChange={set('startDate')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Deadline</label>
                  <input type="date" value={form.deadline?.slice?.(0,10) || ''} onChange={set('deadline')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Progress (%)</label>
                  <input type="number" min={0} max={100} value={form.progress || 0} onChange={set('progress')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Tags (comma separated)</label>
                  <input value={form.tags} onChange={set('tags')} placeholder="design, mobile, Q1"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={set('description')} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" />
                </div>
                {/* Team selection */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Team Members</label>
                  <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                    {(employees || []).map(emp => (
                      <label key={emp._id} className={clsx(
                        'flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors text-xs',
                        form.team.includes(emp._id) ? 'border-primary bg-primary-50 text-primary' : 'border-gray-100 hover:border-gray-200'
                      )}>
                        <input type="checkbox" checked={form.team.includes(emp._id)} onChange={() => toggleTeam(emp._id)} className="hidden" />
                        <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center text-primary text-[9px] font-bold shrink-0">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <span className="truncate">{emp.firstName} {emp.lastName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 text-xs">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs disabled:opacity-60">
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
