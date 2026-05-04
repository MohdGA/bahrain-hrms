import { useState } from 'react';
import { Plus, X, Star, TrendingUp, Award, Users, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../store/authStore.jsx';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SCORE_LABELS = { 1:'Poor', 2:'Below Average', 3:'Average', 4:'Good', 5:'Excellent' };
const SCORE_COLORS = { 1:'text-red-500', 2:'text-orange-500', 3:'text-yellow-500', 4:'text-blue-600', 5:'text-green-600' };
const SCORE_BG     = { 1:'bg-red-50', 2:'bg-orange-50', 3:'bg-yellow-50', 4:'bg-blue-50', 5:'bg-green-50' };

const DEFAULT_KPIS = [
  { title:'Quality of Work',     target:100, achieved:'', score:'', weight:2 },
  { title:'Timeliness',          target:100, achieved:'', score:'', weight:2 },
  { title:'Communication',       target:100, achieved:'', score:'', weight:1 },
  { title:'Teamwork',            target:100, achieved:'', score:'', weight:1 },
  { title:'Initiative',          target:100, achieved:'', score:'', weight:1 },
];

function StarRating({ value, onChange, size = 18 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange?.(n)} className="focus:outline-none">
          <Star size={size}
            className={clsx('transition-colors', n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200')} />
        </button>
      ))}
    </div>
  );
}

function ScoreBadge({ score }) {
  if (!score) return null;
  const s = Math.round(score);
  return (
    <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-full', SCORE_BG[s], SCORE_COLORS[s])}>
      {score.toFixed ? score.toFixed(1) : score} — {SCORE_LABELS[s]}
    </span>
  );
}

export default function Performance() {
  const { user } = useAuth();
  const isManager = ['admin','hr_officer'].includes(user?.role);
  const [tab, setTab]             = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [expanded, setExpanded]   = useState(null);
  const [form, setForm] = useState({
    employeeId:'', period:'Q1 2026', periodType:'Quarterly',
    kpis: DEFAULT_KPIS.map(k => ({...k})),
    strengths:'', improvements:'', goals:'',
  });

  const { data: reviews, loading: revLoading, refetch: refetchReviews } = useFetch('/performance');
  const { data: scores,  loading: scLoading  } = useFetch('/performance/team-scores');
  const { data: employees } = useFetch('/employees?limit=200&status=Active');

  const setKpi = (i, field, val) => {
    setForm(p => {
      const kpis = [...p.kpis];
      kpis[i] = { ...kpis[i], [field]: field === 'score' ? Number(val) : val };
      return { ...p, kpis };
    });
  };

  const addKpi = () => setForm(p => ({ ...p, kpis: [...p.kpis, { title:'', target:100, achieved:'', score:'', weight:1 }] }));
  const removeKpi = i => setForm(p => ({ ...p, kpis: p.kpis.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    if (!form.employeeId) return toast.error('Select an employee');
    const filled = form.kpis.filter(k => k.title && k.score);
    if (!filled.length) return toast.error('Add at least one scored KPI');
    setSaving(true);
    try {
      await api.post('/performance', { ...form, employee: form.employeeId, kpis: filled, status: 'Submitted' });
      toast.success('Review submitted!');
      setShowModal(false);
      refetchReviews();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const acknowledge = async (id) => {
    try {
      await api.put(`/performance/${id}/acknowledge`);
      toast.success('Review acknowledged'); refetchReviews();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const avgScore = scores?.length
    ? (scores.reduce((s, r) => s + r.avgScore, 0) / scores.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Performance</h1>
          <p className="text-sm text-gray-500 mt-0.5">KPI-based performance reviews and team scores</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['overview','reviews','team'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                  tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}>
                {t}
              </button>
            ))}
          </div>
          {isManager && (
            <button onClick={() => setShowModal(true)} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={13} /> New Review
            </button>
          )}
        </div>
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users,     label:'Reviewed',       value: reviews?.length ?? 0,          color:'bg-primary' },
              { icon: Star,      label:'Avg Team Score',  value: avgScore,                      color:'bg-amber-400' },
              { icon: Award,     label:'Top Performers',  value: scores?.filter(s => s.avgScore >= 4).length ?? 0, color:'bg-green-500' },
              { icon: TrendingUp,label:'Need Improvement',value: scores?.filter(s => s.avgScore < 3).length ?? 0, color:'bg-red-400' },
            ].map(({ icon:Icon, label, value, color }) => (
              <div key={label} className="card flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Top performers */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Team Leaderboard</h3>
            {scLoading ? <div className="h-32 bg-gray-50 animate-pulse rounded-xl" /> : (
              <div className="space-y-2">
                {(!scores || scores.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-8">No reviews yet. Create the first one!</p>
                )}
                {(scores || []).slice(0, 10).map((s, i) => (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400')}>
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {s.emp?.firstName?.[0]}{s.emp?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.emp?.firstName} {s.emp?.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">{s.emp?.department}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className="hidden sm:flex"><StarRating value={Math.round(s.avgScore)} size={14} /></span>
                      <ScoreBadge score={s.avgScore} />
                      <span className="text-xs text-gray-400 hidden sm:inline">{s.reviews} review{s.reviews !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Reviews tab */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {revLoading && <div className="h-32 bg-gray-50 animate-pulse rounded-xl" />}
          {(!reviews || reviews.length === 0) && !revLoading && (
            <div className="card text-center py-12 text-gray-400">
              <Award size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No reviews yet.</p>
            </div>
          )}
          {(reviews || []).map(r => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                    {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{r.employee?.firstName} {r.employee?.lastName}</p>
                    <p className="text-xs text-gray-400">{r.employee?.department} · {r.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ScoreBadge score={r.overallScore} />
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                    r.status === 'Acknowledged' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                    {r.status}
                  </span>
                  <button onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                    {expanded === r._id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {expanded === r._id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {r.kpis?.map((k, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-gray-700">{k.title}</p>
                        <StarRating value={k.score} size={13} />
                        <p className="text-[10px] text-gray-400 mt-1">{SCORE_LABELS[k.score]}</p>
                      </div>
                    ))}
                  </div>
                  {r.strengths && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Strengths</p>
                      <p className="text-sm text-gray-700 bg-green-50 rounded-xl p-3">{r.strengths}</p>
                    </div>
                  )}
                  {r.improvements && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Areas for Improvement</p>
                      <p className="text-sm text-gray-700 bg-amber-50 rounded-xl p-3">{r.improvements}</p>
                    </div>
                  )}
                  {r.goals && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Goals for Next Period</p>
                      <p className="text-sm text-gray-700 bg-blue-50 rounded-xl p-3">{r.goals}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Reviewed by: {r.reviewer?.firstName} {r.reviewer?.lastName}</span>
                    {r.status !== 'Acknowledged' && r.employee?._id === user?.id && (
                      <button onClick={() => acknowledge(r._id)} className="btn-primary text-xs py-1.5">
                        Acknowledge Review
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Team tab */}
      {tab === 'team' && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Individual Scores</h3>
          {scLoading ? <div className="h-32 bg-gray-50 animate-pulse rounded-xl" /> : (
            <div className="overflow-x-auto -mx-2 px-2"><table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">Employee</th>
                  <th className="text-left pb-3 font-medium">Department</th>
                  <th className="text-left pb-3 font-medium">Reviews</th>
                  <th className="text-left pb-3 font-medium">Avg Score</th>
                  <th className="text-left pb-3 font-medium">Rating</th>
                  <th className="text-left pb-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(!scores || scores.length === 0) && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No data yet</td></tr>
                )}
                {(scores || []).map((s, i) => (
                  <tr key={s._id} className="hover:bg-gray-50/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold">
                          {s.emp?.firstName?.[0]}{s.emp?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{s.emp?.firstName} {s.emp?.lastName}</p>
                          <p className="text-xs text-gray-400">{s.emp?.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-gray-600">{s.emp?.department}</td>
                    <td className="py-3 text-xs text-gray-600">{s.reviews}</td>
                    <td className="py-3"><ScoreBadge score={s.avgScore} /></td>
                    <td className="py-3"><StarRating value={Math.round(s.avgScore)} size={14} /></td>
                    <td className="py-3">
                      <span className={clsx('text-xs font-medium',
                        s.lastScore >= s.avgScore ? 'text-green-600' : 'text-red-500')}>
                        {s.lastScore >= s.avgScore ? '↑' : '↓'} {s.lastScore?.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {/* New Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">New Performance Review</h2>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Employee *</label>
                  <select value={form.employeeId} onChange={e => setForm(p => ({...p, employeeId: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="">Select employee...</option>
                    {(employees || []).map(e => (
                      <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.department}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Period</label>
                  <input value={form.period} onChange={e => setForm(p => ({...p, period: e.target.value}))}
                    placeholder="Q1 2026" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                  <select value={form.periodType} onChange={e => setForm(p => ({...p, periodType: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {['Monthly','Quarterly','Half-Yearly','Annual'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* KPIs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700">KPI Scores</label>
                  <button onClick={addKpi} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus size={12} /> Add KPI
                  </button>
                </div>
                <div className="space-y-2">
                  {form.kpis.map((kpi, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-3">
                      <div className="col-span-4">
                        <input value={kpi.title} onChange={e => setKpi(i,'title',e.target.value)}
                          placeholder="KPI name" className="w-full bg-transparent text-sm focus:outline-none font-medium" />
                      </div>
                      <div className="col-span-5 flex items-center gap-2">
                        <StarRating value={kpi.score} onChange={v => setKpi(i,'score',v)} />
                        <span className={clsx('text-xs', kpi.score ? SCORE_COLORS[kpi.score] : 'text-gray-300')}>
                          {kpi.score ? SCORE_LABELS[kpi.score] : '—'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <input type="number" value={kpi.weight} onChange={e => setKpi(i,'weight',Number(e.target.value))}
                          min={1} max={5} placeholder="Weight"
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {form.kpis.length > 1 && (
                          <button onClick={() => removeKpi(i)} className="text-gray-300 hover:text-red-400">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Strengths</label>
                  <textarea value={form.strengths} onChange={e => setForm(p => ({...p, strengths: e.target.value}))}
                    rows={2} placeholder="What does this employee do well?"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Areas for Improvement</label>
                  <textarea value={form.improvements} onChange={e => setForm(p => ({...p, improvements: e.target.value}))}
                    rows={2} placeholder="What can be improved?"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Goals for Next Period</label>
                  <textarea value={form.goals} onChange={e => setForm(p => ({...p, goals: e.target.value}))}
                    rows={2} placeholder="Set goals for next cycle..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 text-xs">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 text-xs disabled:opacity-60">
                {saving ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
