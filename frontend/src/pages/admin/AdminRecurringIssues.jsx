import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import PriorityBadge from '../../components/PriorityBadge';
import { RefreshCw, AlertTriangle, Layers } from 'lucide-react';

export const AdminRecurringIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const resp = await adminApi.getRecurringIssues();
      setIssues(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-500" />
            Recurring Problem Clusters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated cluster analysis identifying repeat complaints and frequent root causes
          </p>
        </div>
        <button
          onClick={fetchRecurring}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-scan Issues
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Analyzing recurring clusters...</div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No recurring patterns detected.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Cluster Keyword</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Frequency</th>
                  <th className="px-5 py-3">Sample Issue Subject</th>
                  <th className="px-5 py-3">Assessed Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {it.keyword}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {it.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-brand-600">
                      {it.frequency} tickets
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium max-w-sm truncate">
                      {it.sample_subject}
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={it.severity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRecurringIssues;
