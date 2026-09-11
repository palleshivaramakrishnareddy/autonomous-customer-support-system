import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../../services/api';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { 
  PlusCircle, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Bot
} from 'lucide-react';

export const CustomerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const resp = await ticketsApi.getTickets();
        setTickets(resp.data);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const total = tickets.length;
  const open = tickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const resolved = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length;
  const pending = tickets.filter((t) => ['WAITING_FOR_CUSTOMER', 'AI_ANALYZING'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-brand-700/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            24/7 Autonomous Multi-Agent Support Active
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Customer Support Portal</h1>
          <p className="mt-1 text-xs md:text-sm text-blue-100 max-w-xl">
            Need help with login, billing, technical questions, or features? Submit an issue and our AI agents will immediately analyze and resolve it.
          </p>
        </div>
        <Link
          to="/customer/tickets/new"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-brand-700 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all flex-shrink-0 group"
        >
          <PlusCircle className="w-4 h-4 text-brand-600 group-hover:rotate-90 transition-transform" />
          Create New Ticket
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Tickets</span>
            <Ticket className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{total}</div>
          <p className="text-[11px] text-slate-400 mt-1">All tickets submitted</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Open Tickets</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{open}</div>
          <p className="text-[11px] text-slate-400 mt-1">Under active processing</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved Tickets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{resolved}</div>
          <p className="text-[11px] text-slate-400 mt-1">Successfully solved</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">Pending Action</span>
            <AlertTriangle className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pending}</div>
          <p className="text-[11px] text-slate-400 mt-1">Waiting on your reply</p>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Tickets</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status of your support inquiries</p>
          </div>
          <Link
            to="/customer/tickets"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading your tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <Bot className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No tickets yet</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Have an inquiry or issue? Create your first ticket now.</p>
            <Link
              to="/customer/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow hover:bg-brand-500"
            >
              <PlusCircle className="w-4 h-4" /> Create Ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Ticket #</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.slice(0, 6).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-brand-600 font-mono">
                      {t.ticket_number}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium font-mono">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <TicketStatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/customer/tickets/${t.id}`}
                        className="font-bold text-brand-600 hover:text-brand-800"
                      >
                        Details →
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

export default CustomerDashboard;
