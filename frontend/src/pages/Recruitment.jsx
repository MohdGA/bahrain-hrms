import { useState } from 'react';
import { Plus, X, Users, Briefcase, TrendingUp, CheckCircle, ChevronRight, MoreVertical, Star } from 'lucide-react';
import api from '../utils/api';
import useFetch from '../hooks/useFetch';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STAGES = ['Applied','Screening','Interview','Assessment','Offer','Hired','Rejected'];
const STAGE_COLORS = {
  Applied:    'bg-gray-100 text-gray-700',
  Screening:  'bg-blue-100 text-blue-700',
  Interview:  'bg-purple-100 text-purple-700',
  Assessment: 'bg-yellow-100 text-yellow-700',
  Offer:      'bg-orange-100 text-orange-700',
  Hired:      'bg-green-100 text-green-700',
  Rejected:   'bg-red-100 text-red-600',
};

const DEPTS = ['Administration','Engineering','Finance','Human Resources','Marketing','Operations','Sales','IT','Legal','Design'];
const emptyJob = { title:'', department:'', type:'Full-Time', location:'Bahrain', description:'', deadline:'', salaryMin:'', salaryMax:'' };
const emptyApp = { candidateName:'', email:'', phone:'', nationality:'', currentRole:'', experience:'', source:'Website', coverLetter:'', jobId:'' };

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function Recruitment() {
  const [view, setView]           = useState('jobs'); // 'jobs' | 'pipeline'
  const [showJobModal, setShowJobModal]   = useState(false);
  const [showAppModal, setShowAppModal]   = useState(false);
  const [jobForm, setJobForm]     = useState(emptyJob);
  const [appForm, setAppForm]     = useState(emptyApp);
  const [selectedJob, setSelectedJob]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const { data: stats,  refetch: refetchStats } = useFetch('/recruitment/pipeline-stats');
  const { data: jobs,   refetch: refetchJobs  } = useFetch('/recruitment/jobs');
  const { data: apps,   refetch: refetchApps  } = useFetch(
    selectedJob ? `/recruitment/applications?jobId=${selectedJob._id}` : '/recruitment/applications',
    [selectedJob?._id]
  );

  const setJ = f => e => setJobForm(p => ({ ...p, [f]: e.target.value }));
  const setA = f => e => setAppForm(p => ({ ...p, [f]: e.target.value }));

  const saveJob = async () => {
    if (!jobForm.title || !jobForm.department) return toast.error('Title and department are required');
    setSaving(true);
    try {
      await api.post('/recruitment/jobs', jobForm);
      toast.success('Job posted!');
      setShowJobModal(false); setJobForm(emptyJob); refetchJobs(); refetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const saveApp = async () => {
    if (!appForm.candidateName || !appForm.email || !appForm.jobId) return toast.error('Name, email and job are required');
    setSaving(true);
    try {
      await api.post('/recruitment/applications', appForm);
      toast.success('Application added!');
      setShowAppModal(false); setAppForm(emptyApp); refetchApps(); refetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const moveStage = async (appId, stage) => {
    try {
      await api.put(`/recruitment/applications/${appId}`, { stage });
      toast.success(`Moved to ${stage}`);
      refetchApps(); refetchStats();
    } catch { toast.error('Failed to update stage'); }
  };

  const closeJob = async (jobId) => {
    try {
      await api.put(`/recruitment/jobs/${jobId}`, { status: 'Closed' });
      toast.success('Job closed'); refetchJobs(); refetchStats();
    } catch { toast.error('Failed'); }
  };

  const pipelineMap = {};
  STAGES.forEach(s => { pipelineMap[s] = (apps || []).filter(a => a.stage === s); });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage job postings and hiring pipeline</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['jobs','pipeline'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                  view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAppModal(true)} className="btn-outline text-xs flex items-center gap-1.5">
            <Users size={13} /> Add Candidate
          </button>
          <button onClick={() => setShowJobModal(true)} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus size={13} /> Post Job
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Briefcase}   label="Open Positions"    value={stats?.totalJobs}  color="bg-primary" />
        <StatCard icon={Users}       label="Total Applicants"  value={stats?.totalApps}  color="bg-purple-500" />
        <StatCard icon={CheckCircle} label="Hired This Cycle"  value={stats?.hired}      color="bg-green-500" />
        <StatCard icon={TrendingUp}  label="Conversion Rate"   value={`${stats?.convRate ?? 0}%`} color="bg-amber-500" />
      </div>

      {/* Jobs View */}
      {view === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(!jobs || jobs.length === 0) && (
            <div className="col-span-3 card text-center py-12 text-gray-400">
              <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No jobs posted yet. Click "Post Job" to get started.</p>
            </div>
          )}
          {(jobs || []).map(job => (
            <div key={job._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{job.department} · {job.type}</p>
                </div>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                  job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {job.status}
                </span>
              </div>
              {job.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{job.description}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={12} />
                  <span>{job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelectedJob(job); setView('pipeline'); }}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
                    View Pipeline <ChevronRight size={12} />
                  </button>
                  {job.status === 'Open' && (
                    <button onClick={() => closeJob(job._id)}
                      className="text-xs text-gray-400 hover:text-red-500 ml-2">Close</button>
                  )}
                </div>
              </div>
              {job.deadline && (
                <p className="text-[10px] text-gray-400 mt-2">
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pipeline Kanban View */}
      {view === 'pipeline' && (
        <>
          {selectedJob && (
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => { setSelectedJob(null); }} className="text-xs text-primary hover:underline">← All jobs</button>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs font-medium text-gray-700">{selectedJob.title}</span>
            </div>
          )}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {STAGES.map(stage => (
              <div key={stage} className="shrink-0 w-56">
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', STAGE_COLORS[stage])}>
                    {stage}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{pipelineMap[stage].length}</span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  {pipelineMap[stage].map(app => (
                    <div key={app._id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{app.candidateName}</p>
                          <p className="text-[10px] text-gray-400">{app.currentRole || 'Candidate'}</p>
                        </div>
                        <div className="relative group">
                          <button className="text-gray-300 hover:text-gray-500"><MoreVertical size={13} /></button>
                          <div className="absolute right-0 top-5 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-10 hidden group-hover:block">
                            {STAGES.filter(s => s !== stage).map(s => (
                              <button key={s} onClick={() => moveStage(app._id, s)}
                                className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl">
                                Move to {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {app.job?.title && <p className="text-[10px] text-primary mt-1">{app.job.title}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-400">{app.source}</span>
                        {app.rating && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                            <Star size={9} fill="currentColor" /> {app.rating}
                          </span>
                        )}
                      </div>
                      {app.interviewDate && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          📅 {new Date(app.interviewDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                  {pipelineMap[stage].length === 0 && (
                    <div className="border-2 border-dashed border-gray-100 rounded-xl h-16 flex items-center justify-center">
                      <span className="text-[10px] text-gray-300">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline stats bar */}
          {stats?.pipeline && (
            <div className="card">
              <p className="text-xs font-semibold text-gray-500 mb-3">Pipeline Overview</p>
              <div className="flex gap-2">
                {stats.pipeline.map(p => (
                  <div key={p.stage} className="flex-1 text-center">
                    <div className={clsx('rounded-xl py-2', STAGE_COLORS[p.stage])}>
                      <p className="text-lg font-bold">{p.count}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{p.stage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Post Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Post New Job</h2>
              <button onClick={() => setShowJobModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Job Title *</label>
                  <input value={jobForm.title} onChange={setJ('title')} placeholder="e.g. Senior Software Engineer"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Department *</label>
                  <select value={jobForm.department} onChange={setJ('department')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="">Select...</option>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                  <select value={jobForm.type} onChange={setJ('type')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {['Full-Time','Part-Time','Contract','Internship'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Min Salary (BHD)</label>
                  <input value={jobForm.salaryMin} onChange={setJ('salaryMin')} placeholder="500"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Max Salary (BHD)</label>
                  <input value={jobForm.salaryMax} onChange={setJ('salaryMax')} placeholder="1200"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Deadline</label>
                  <input type="date" value={jobForm.deadline} onChange={setJ('deadline')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                  <textarea value={jobForm.description} onChange={setJ('description')} rows={4} placeholder="Job responsibilities, benefits..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowJobModal(false)} className="btn-outline flex-1 text-xs">Cancel</button>
              <button onClick={saveJob} disabled={saving} className="btn-primary flex-1 text-xs disabled:opacity-60">
                {saving ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add Candidate</h2>
              <button onClick={() => setShowAppModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                  <input value={appForm.candidateName} onChange={setA('candidateName')} placeholder="John Smith"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
                  <input type="email" value={appForm.email} onChange={setA('email')} placeholder="john@email.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                  <input value={appForm.phone} onChange={setA('phone')} placeholder="+973 XXXX XXXX"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Nationality</label>
                  <input value={appForm.nationality} onChange={setA('nationality')} placeholder="Bahraini"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Current Role</label>
                  <input value={appForm.currentRole} onChange={setA('currentRole')} placeholder="Software Engineer at..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Years Experience</label>
                  <input type="number" value={appForm.experience} onChange={setA('experience')} placeholder="3"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Applying For *</label>
                  <select value={appForm.jobId} onChange={setA('jobId')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="">Select job...</option>
                    {(jobs || []).filter(j => j.status === 'Open').map(j => (
                      <option key={j._id} value={j._id}>{j.title} — {j.department}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Source</label>
                  <select value={appForm.source} onChange={setA('source')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {['LinkedIn','Indeed','Referral','Walk-in','Website','Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowAppModal(false)} className="btn-outline flex-1 text-xs">Cancel</button>
              <button onClick={saveApp} disabled={saving} className="btn-primary flex-1 text-xs disabled:opacity-60">
                {saving ? 'Adding...' : 'Add Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
