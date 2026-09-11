import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketsApi } from '../../services/api';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import AIConfidenceBadge from '../../components/AIConfidenceBadge';
import Modal from '../../components/Modal';
import { 
  Bot, 
  User, 
  Send, 
  CheckCircle2, 
  Clock, 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  Headphones,
  Check
} from 'lucide-react';

export const CustomerTicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchDetails = async () => {
    try {
      const resp = await ticketsApi.getTicket(id);
      setTicket(resp.data);
      setMessages(resp.data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, [id]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await ticketsApi.addMessage(id, { message: reply });
      setReply('');
      fetchDetails();
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await ticketsApi.submitFeedback(id, { rating, comment });
      setFeedbackOpen(false);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading ticket #{id}...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-700">Ticket not found</p>
        <Link to="/customer/tickets" className="text-xs font-bold text-brand-600">
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link
        to="/customer/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Tickets
      </Link>

      {/* Ticket Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-base font-black font-mono text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
              {ticket.ticket_number}
            </span>
            <TicketStatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <div className="flex items-center gap-2">
            <AIConfidenceBadge confidence={ticket.ai_confidence} />
            {!ticket.feedback && (
              <button
                onClick={() => setFeedbackOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> Rate Support
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900 leading-snug">{ticket.subject}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
            <span>Category: <strong className="text-slate-700 font-mono">{ticket.category}</strong></span>
            <span>Severity: <strong className="text-slate-700">{ticket.severity}</strong></span>
            <span>Sentiment: <strong className="text-slate-700">{ticket.sentiment}</strong></span>
            <span>Created: <strong className="text-slate-700">{new Date(ticket.created_at).toLocaleString()}</strong></span>
            {ticket.assigned_agent_name && (
              <span>Assigned Agent: <strong className="text-brand-600">{ticket.assigned_agent_name}</strong></span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Conversation Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[550px]">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Conversation Timeline
            </h3>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((m) => {
                const isCustomer = m.sender_type === 'CUSTOMER';
                const isAI = m.sender_type === 'AI';
                const isSystem = m.sender_type === 'SYSTEM';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {isAI && <Bot className="w-3.5 h-3.5 text-purple-600" />}
                      {!isCustomer && !isAI && <Headphones className="w-3.5 h-3.5 text-blue-600" />}
                      <span className="text-[11px] font-bold text-slate-600">
                        {m.sender_name || (isAI ? 'Autonomous AI' : 'Support Team')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                        isCustomer
                          ? 'bg-brand-600 text-white rounded-br-none'
                          : isAI
                          ? 'bg-purple-50/80 text-purple-950 border border-purple-200 rounded-bl-none'
                          : isSystem
                          ? 'bg-amber-50/80 text-amber-950 border border-amber-200 rounded-bl-none'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            {ticket.status !== 'CLOSED' ? (
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            ) : (
              <div className="pt-3 text-center text-xs text-slate-400 font-medium">
                This ticket is marked as CLOSED.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: AI Audit Trail & Feedback */}
        <div className="space-y-4">
          {/* Safe AI Audit Trail */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Decisions Audit Trail
            </div>

            <div className="space-y-3">
              {(ticket.ai_decisions || []).map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-purple-700">{d.agent_name}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {Math.round(d.confidence * 100)}% Conf
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 text-[11px] mb-1">
                    Action: {d.action}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {d.reasoning_summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Feedback Card if given */}
          {ticket.feedback && (
            <div className="bg-amber-50/60 rounded-3xl border border-amber-200 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Your Support Rating</span>
                <div className="flex text-amber-500">
                  {[...Array(ticket.feedback.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  ))}
                </div>
              </div>
              {ticket.feedback.comment && (
                <p className="text-xs text-amber-900 italic">"{ticket.feedback.comment}"</p>
              )}
              <span className="text-[10px] text-amber-700 block font-medium">
                Sentiment tagged: {ticket.feedback.sentiment}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="Rate Your Support Experience"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">{rating} of 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Comments or Feedback
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did the autonomous AI or support team assist you?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFeedbackOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-500 shadow"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerTicketDetail;
