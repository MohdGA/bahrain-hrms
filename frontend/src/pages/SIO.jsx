import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SIO() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear]   = useState(new Date().getFullYear());
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/payroll/sio-invoice/${month}/${year}`);
      setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load SIO invoice');
    } finally {
      setLoading(false);
    }
  };

  const InvoiceTable = ({ title, rows, total, rateNote }) => (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-400">{rateNote}</p>
        </div>
        <span className="text-sm font-bold text-primary">Total: BHD {parseFloat(total).toFixed(3)}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 border-b border-gray-100">
            <th className="text-left pb-2 font-medium">Employee</th>
            <th className="text-right pb-2 font-medium">Basic (BHD)</th>
            <th className="text-right pb-2 font-medium">Employer</th>
            <th className="text-right pb-2 font-medium">Employee</th>
            <th className="text-right pb-2 font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50/50">
              <td className="py-2.5 font-medium text-gray-800">{r.name}</td>
              <td className="py-2.5 text-right text-gray-600">{r.basicSalary.toFixed(3)}</td>
              <td className="py-2.5 text-right text-gray-600">{r.employerContribution.toFixed(3)}</td>
              <td className="py-2.5 text-right text-gray-600">{r.employeeDeduction.toFixed(3)}</td>
              <td className="py-2.5 text-right font-semibold text-gray-800">{r.total.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">SIO / GOSI Invoices</h1>
        <p className="text-sm text-gray-500 mt-0.5">2026 dual-invoice — Bahraini (18%+8%) vs Expat EOSB Fund</p>
      </div>

      <div className="card flex items-end gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Month</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            {Array.from({length:12},(_,i)=>(
              <option key={i+1} value={i+1}>{new Date(2000,i).toLocaleString('default',{month:'long'})}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Year</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={loadInvoice} disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? 'Loading...' : 'Generate SIO Invoice'}
        </button>
      </div>

      {/* Rates reminder */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-blue-50 border-blue-100">
          <p className="font-semibold text-blue-800 text-sm">Bahraini Staff — SIO 2026</p>
          <div className="mt-2 space-y-1 text-xs text-blue-700">
            <p>Employer contribution: <strong>18%</strong> of basic</p>
            <p>Employee deduction: <strong>8%</strong> of basic</p>
            <p>Total: <strong>26%</strong></p>
          </div>
        </div>
        <div className="card bg-purple-50 border-purple-100">
          <p className="font-semibold text-purple-800 text-sm">Expat Staff — EOSB Fund 2026</p>
          <div className="mt-2 space-y-1 text-xs text-purple-700">
            <p>Years 1–3: <strong>4.2%</strong> employer only</p>
            <p>Years 4+: <strong>8.4%</strong> employer only</p>
            <p>No employee deduction</p>
          </div>
        </div>
      </div>

      {data && (
        <>
          <InvoiceTable title="Bahraini Employees — SIO Invoice" rows={data.bahrainiInvoice}
            total={data.bahrainiTotal} rateNote="Employer 18% + Employee 8% = 26%" />
          <InvoiceTable title="Expat Employees — EOSB Fund Invoice" rows={data.expatInvoice}
            total={data.expatTotal} rateNote="4.2% (Yr 1–3) or 8.4% (Yr 4+) employer contribution" />
        </>
      )}
    </div>
  );
}
