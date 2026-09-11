import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi, adminApi } from '../../services/api';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import AIConfidenceBadge from '../../components/AIConfidenceBadge';
import Modal from '../../components/Modal';
import { Search, Trash2, UserPlus, Filter } from 'lucide-react';

export const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [targetAgentId, setTargetAgentId] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status !== 'ALL') params.status = status;

      const resp = await ticketsApi.getTickets(params);
      setTickets(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const loadAgents = async () => {
      try {
        const resp = await adminApi.getUsers({ role: 'SUPPORT_AGENT' });
        setAgents(resp.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadAgents();
  }, [status]);

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Are you sure you want to permanently delete this ticket?')) return;
    try {
      await ticketsApi.deleteTicket(ticketId);
      fetchTickets();
    } catch (err) {
      alert('Failed to delete ticket');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!targetAgentId) return;
    try {
      await ticketsApi.updateTicket(selectedTicket.id, {
        assigned_agent_id: parseInt(targetAgentId)
      });
      setAssignModalOpen(false);
      fetchTickets();
    } catch (err) {
      alert('Failed to assign ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System-Wide Ticket Oversight</h1>
          <p className="text-xs text-slate-500 mt-0.5">Master ledger of all customer tickets across the organization</p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
            placeholder="Search tickets across entire platform..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-brand-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="AI_ANALYZING">AI Analyzing</option>
          <option value="AI_RESPONDED">AI Responded</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
          <option value="ESCALATED">Escalated</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading master ledger...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No tickets found.</div>
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
                  <th className="px-5 py-3">Assigned Agent</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-brand-600 font-mono">{t.ticket_number}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{t.customer_name}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium max-w-xs truncate">{t.subject}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{t.category}</td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-5 py-3.5"><TicketStatusBadge status={t.status} /></td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {t.assigned_agent_name ? (
                        <span className="font-semibold text-brand-700">{t.assigned_agent_name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setTargetAgentId(t.assigned_agent_id ? String(t.assigned_agent_id) : '');
                          setAssignModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-brand-600 rounded transition-colors"
                        title="Reassign Agent"
                      >
                        <UserPlus className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Agent Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Support Agent — ${selectedTicket?.ticket_number}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Support Agent</label>
            <select
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-brand-500"
            >
              <option value="">Choose an agent...</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-500 shadow"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTickets;
