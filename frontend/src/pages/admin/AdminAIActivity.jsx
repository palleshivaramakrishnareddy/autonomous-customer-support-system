import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import AIConfidenceBadge from '../../components/AIConfidenceBadge';
import { Cpu, Sparkles, Filter, RefreshCw } from 'lucide-react';

export const AdminAIActivity = () => {
  const [decisions, setDecisions] = useState([]);
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const resp = await adminApi.getAIDecisions(100);
      setDecisions(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const filtered = agentFilter === 'ALL'
    ? decisions
    : decisions.filter((d) => d.agent_name === agentFilter);

  const agents = ['ALL', 'Intake Agent', 'Classification Agent', 'Knowledge Agent', 'Resolution Agent', 'Supervisor Agent', 'Feedback Agent'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-600" />
            AI Decisions & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all autonomous agent operations, reasoning summaries, and safety approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-purple-500"
          >
            {agents.map((ag) => (
              <option key={ag} value={ag}>
                Agent: {ag}
              </option>
            ))}
          </select>
          <button
            onClick={fetchDecisions}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Audit Trail"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No decisions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Ticket ID</th>
                  <th className="px-5 py-3">Agent</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3">Safe Reasoning Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors font-sans">
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-[10px]">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-brand-700">
                      #{d.ticket_id}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                        {d.agent_name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {d.action}
                    </td>
                    <td className="px-5 py-3.5">
                      <AIConfidenceBadge confidence={d.confidence} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs leading-relaxed max-w-md">
                      {d.reasoning_summary}
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

export default AdminAIActivity;
