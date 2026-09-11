import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketsApi, aiApi } from '../../services/api';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import AIConfidenceBadge from '../../components/AIConfidenceBadge';
import { 
  Bot, 
  User, 
  Send, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowLeft,
  Headphones,
  FileEdit,
  AlertTriangle,
  RotateCcw,
  Check,
  XCircle
} from 'lucide-react';

export const AgentTicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const fetchTicket = async () => {
    try {
      const resp = await ticketsApi.getTicket(id);
      setTicket(resp.data);
      setMessages(resp.data.messages || []);
      setStatus(resp.data.status);
      setPriority(resp.data.priority);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await ticketsApi.updateTicket(id, { status: newStatus });
      setStatus(newStatus);
      fetchTicket();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleUpdatePriority = async (newPriority) => {
    try {
      await ticketsApi.updateTicket(id, { priority: newPriority });
      setPriority(newPriority);
      fetchTicket();
    } catch (err) {
      alert('Failed to update priority');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await ticketsApi.addMessage(id, {
        message: replyText,
        is_internal: isInternal
      });
      setReplyText('');
      setIsInternal(false);
      fetchTicket();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateAIDraft = async () => {
    setAiDraftLoading(true);
    try {
      const resp = await aiApi.generateResponse(id);
      if (resp.data.suggested_response) {
        setReplyText(resp.data.suggested_response);
      }
    } catch (err) {
      alert('Could not generate AI draft');
    } finally {
      setAiDraftLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading case details...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm font-bold text-slate-700">Ticket not found</p>
        <Link to="/agent/tickets" className="text-xs text-brand-600 font-bold">Back to Queue</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link
        to="/agent/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Link>

      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-base font-black font-mono text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
              {ticket.ticket_number}
            </span>
            <TicketStatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <AIConfidenceBadge confidence={ticket.ai_confidence} />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {ticket.status !== 'RESOLVED' && (
              <button
                onClick={() => handleUpdateStatus('RESOLVED')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Mark Resolved
              </button>
            )}
            {ticket.status !== 'CLOSED' && (
              <button
                onClick={() => handleUpdateStatus('CLOSED')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Close Ticket
              </button>
            )}
          </div>
        </div>

        {/* Customer Issue Details */}
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-snug">{ticket.subject}</h1>
          <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {ticket.description}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
            <span>Customer: <strong className="text-slate-700">{ticket.customer_name}</strong></span>
            <span>Category: <strong className="text-slate-700 font-mono">{ticket.category}</strong></span>
            <span>Severity: <strong className="text-slate-700">{ticket.severity}</strong></span>
            <span>Sentiment: <strong className="text-slate-700">{ticket.sentiment}</strong></span>
            <span>Created: <strong className="text-slate-700">{new Date(ticket.created_at).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Message Stream & Reply Composer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[580px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Ticket Communications</h3>
              <button
                onClick={handleGenerateAIDraft}
                disabled={aiDraftLoading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                {aiDraftLoading ? 'Generating...' : 'Auto-Draft with AI'}
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((m) => {
                const isCustomer = m.sender_type === 'CUSTOMER';
                const isInternalNote = m.is_internal;
                const isAI = m.sender_type === 'AI';
                const isSystem = m.sender_type === 'SYSTEM';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {isInternalNote && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" /> INTERNAL NOTE
                        </span>
                      )}
                      {isAI && <Bot className="w-3.5 h-3.5 text-purple-600" />}
                      <span className="text-[11px] font-bold text-slate-600">
                        {m.sender_name || (isAI ? 'Autonomous AI' : isCustomer ? 'Customer' : 'Agent')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                        isInternalNote
                          ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-br-none'
                          : isCustomer
                          ? 'bg-slate-100 text-slate-900 rounded-bl-none'
                          : isAI
                          ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-br-none'
                          : isSystem
                          ? 'bg-rose-50 text-rose-950 border border-rose-200 rounded-br-none'
                          : 'bg-brand-600 text-white rounded-br-none'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span>Post as Internal Note (Customer will not see this)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isInternal ? "Write internal case note..." : "Write customer response..."}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none resize-none transition-all ${
                    isInternal
                      ? 'border-amber-300 bg-amber-50/50 focus:border-amber-500'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                  }`}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all self-end ${
                    isInternal
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-brand-600 hover:bg-brand-500 text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> {isInternal ? 'Save Note' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Triage Control Panel & AI Insights */}
        <div className="space-y-4">
          {/* Triage Status Controls */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Triage Controls
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-brand-500"
              >
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="WAITING_FOR_CUSTOMER">WAITING_FOR_CUSTOMER</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => handleUpdatePriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-brand-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* AI Decision Audit Trail */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" /> AI Pipeline Decisions
            </h3>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(ticket.ai_decisions || []).map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-700 mb-1">
                    <span>{d.agent_name}</span>
                    <span className="font-mono text-slate-400">{Math.round(d.confidence * 100)}%</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-[11px] mb-0.5">{d.action}</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{d.reasoning_summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTicketDetail;
