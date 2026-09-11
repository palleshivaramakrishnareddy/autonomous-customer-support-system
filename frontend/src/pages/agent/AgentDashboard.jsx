import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../../services/api';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import AIConfidenceBadge from '../../components/AIConfidenceBadge';
import { 
  Headphones, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const resp = await ticketsApi.getTickets();
        setTickets(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const assigned = tickets.filter((t) => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length;
  const escalated = tickets.filter((t) => t.status === 'ESCALATED').length;
  const highPriority = tickets.filter((t) => t.priority === 'HIGH').length;
  const critical = tickets.filter((t) => t.priority === 'CRITICAL').length;
  const resolved = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-3">
            <Headphones className="w-3.5 h-3.5 text-blue-300" />
            Support Agent Workstation
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Agent Triage Dashboard</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-xl">
            Review escalated cases, triage assigned tickets, and collaborate with AI recommendations.
          </p>
        </div>
        <Link
          to="/agent/escalations"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          <ShieldAlert className="w-4 h-4" /> View Escalation Queue
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Assigned</span>
          <div className="text-2xl font-black text-slate-900">{assigned}</div>
          <span className="text-[10px] text-slate-400">Active tickets</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">Escalated</span>
          <div className="text-2xl font-black text-rose-600">{escalated}</div>
          <span className="text-[10px] text-slate-400">Needs human review</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block mb-1">High Priority</span>
          <div className="text-2xl font-black text-orange-600">{highPriority}</div>
          <span className="text-[10px] text-slate-400">Expedited triage</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block mb-1">Critical</span>
          <div className="text-2xl font-black text-red-700 animate-pulse">{critical}</div>
          <span className="text-[10px] text-slate-400">Immediate action</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">Resolved Today</span>
          <div className="text-2xl font-black text-emerald-600">{resolved}</div>
          <span className="text-[10px] text-slate-400">Closed or solved</span>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Assigned & Escalated Tickets</h2>
            <p className="text-xs text-slate-400 mt-0.5">Prioritized queue ordered by urgency and date</p>
          </div>
          <Link
            to="/agent/tickets"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No active tickets to display.</div>
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
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3 text-right">Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.slice(0, 8).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-brand-600 font-mono">{t.ticket_number}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{t.customer_name || 'Customer'}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium max-w-xs truncate">{t.subject}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{t.category}</td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-5 py-3.5"><TicketStatusBadge status={t.status} /></td>
                    <td className="px-5 py-3.5"><AIConfidenceBadge confidence={t.ai_confidence} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/agent/tickets/${t.id}`}
                        className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold transition-colors"
                      >
                        Open →
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

export default AgentDashboard;
