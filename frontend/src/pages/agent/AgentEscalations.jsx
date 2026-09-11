import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../../services/api';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import AIConfidenceBadge from '../../components/AIConfidenceBadge';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const AgentEscalations = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscalations = async () => {
      try {
        const resp = await ticketsApi.getTickets({ status: 'ESCALATED' });
        setEscalations(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEscalations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            Escalation Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cases escalated by the Autonomous AI Supervisor due to critical severity, low confidence, or policy requirements
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading escalations...</div>
        ) : escalations.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No pending escalations</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All escalated tickets have been assigned and triaged!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Ticket #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">AI Confidence</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {escalations.map((t) => (
                  <tr key={t.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-rose-600 font-mono">{t.ticket_number}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{t.customer_name || 'Customer'}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium max-w-sm truncate">{t.subject}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{t.category}</td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-5 py-3.5"><AIConfidenceBadge confidence={t.ai_confidence} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/agent/tickets/${t.id}`}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors"
                      >
                        Claim & Triage →
                      </Link>
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

export default AgentEscalations;
