import { useState } from 'react';
import { FileCheck, CheckCircle, AlertTriangle, Download, Shield } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const pipeline = [
  { id: 1, role: 'HR Officer (Maker)',       icon: FileCheck,   status: 'done',    label: 'Payroll Generated' },
  { id: 2, role: 'Finance Manager (Checker)',icon: CheckCircle, status: 'done',    label: 'Approved'          },
  { id: 3, role: 'WRP (Submit)',             icon: Shield,      status: 'current', label: 'Awaiting WRP'      },
];

export default function WPS() {
  const [month, setMonth]     = useState(new Date().getMonth() + 1);
  const [year, setYear]       = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState([]);

  const handleGenerate = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await api.post('/wps/generate-sif', { month, year }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href = url;
      a.download = `SIF_${year}_${String(month).padStart(2, '0')}.csv`;
      a.click();
      toast.success('SIF file generated and downloaded!');
    } catch (err) {
      if (err.response?.data?.validationErrors) {
        setErrors(err.response.data.validationErrors);
        toast.error('Validation errors found — fix before submitting');
      } else {
        toast.error(err.response?.data?.message || 'Failed to generate SIF');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">WPS Submission</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wage Protection System 2.0 — Fawri Transfer via LMRA Portal</p>
      </div>

      {/* Maker-Checker Pipeline */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Approval Pipeline</h2>
        <div className="flex items-center gap-0">
          {pipeline.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl
                ${step.status === 'done' ? 'bg-green-50' : step.status === 'current' ? 'bg-primary-50' : 'bg-gray-50'}`}>
                <step.icon size={20} className={step.status === 'done' ? 'text-green-600' : step.status === 'current' ? 'text-primary' : 'text-gray-400'} />
                <p className="text-xs font-semibold text-gray-700">{step.role}</p>
                <p className="text-xs text-gray-500">{step.label}</p>
              </div>
              {i < pipeline.length - 1 && <div className="w-8 h-0.5 bg-gray-200 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Generate SIF */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Generate SIF File</h2>
        <div className="flex items-end gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Month</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100">
              {Array.from({length:12},(_,i)=>(
                <option key={i+1} value={i+1}>{new Date(2000,i).toLocaleString('default',{month:'long'})}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Year</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100">
              {[2024,2025,2026].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={handleGenerate} disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <Download size={15} />
            {loading ? 'Generating...' : 'Generate & Download SIF'}
          </button>
          <a href="/api/wps/sif-sample" className="btn-outline flex items-center gap-2 text-xs">
            Download Sample
          </a>
        </div>

        {errors.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-sm font-semibold text-red-700">Validation Errors — SIF Blocked</span>
            </div>
            <ul className="space-y-1">
              {errors.map((e, i) => (
                <li key={i} className="text-xs text-red-600">
                  Employee {e.employeeId}: {e.errors.map(x => x.message).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Compliance notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>2026 WPS 2.0 Mandate:</strong> All salaries must be transferred via <strong>Fawri Transfer</strong> through the LMRA portal.
          Direct bank transfers are non-compliant and may result in penalties.
        </p>
      </div>
    </div>
  );
}
