import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi } from '../../services/api';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import AIConfidenceBadge from '../../components/AIConfidenceBadge';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';

const CATEGORIES = [
  'GENERAL', 'TECHNICAL', 'BILLING', 'ACCOUNT', 'LOGIN', 
  'PAYMENT', 'PRODUCT', 'SERVICE', 'BUG', 'FEATURE_REQUEST', 
  'COMPLAINT', 'OTHER'
];

export const CreateTicket = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide both a subject and a description.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setAnalysisStep('Intake Agent: Reading and parsing your issue...');

    try {
      // Step simulation for visual polish while orchestrator runs
      setTimeout(() => setAnalysisStep('Classification Agent: Categorizing and determining severity...'), 600);
      setTimeout(() => setAnalysisStep('Knowledge Agent: Searching internal articles and verified solutions...'), 1200);
      setTimeout(() => setAnalysisStep('Supervisor Agent: Validating safety rules and approving action...'), 1800);

      const resp = await ticketsApi.createTicket({
        subject,
        description,
        category: category || null
      });

      setAnalysisResult(resp.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Support Ticket</h1>
        <p className="text-xs text-slate-500 mt-1">
          Our Autonomous Multi-Agent AI system will analyze your issue, check the knowledge base, and attempt instant resolution.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!analysisResult ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Issue Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. I cannot login because my password is not working"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Category <span className="text-slate-400 font-normal">(Optional — AI will auto-detect if left blank)</span>
                </label>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium outline-none transition-all bg-white"
              >
                <option value="">Auto-Detect with AI (Recommended)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened, steps to reproduce, or error messages received..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium outline-none transition-all resize-none"
              />
            </div>

            {isSubmitting ? (
              <div className="p-6 rounded-2xl bg-brand-50/80 border border-brand-200 text-center space-y-3 animate-in fade-in">
                <div className="flex items-center justify-center gap-2 text-brand-700 font-bold text-sm">
                  <Bot className="w-5 h-5 animate-bounce" />
                  <span>AI is analyzing your issue...</span>
                </div>
                <p className="text-xs text-brand-600 font-medium">{analysisStep}</p>
                <div className="w-48 mx-auto bg-brand-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-600 h-full rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" /> Submit to Autonomous AI
                </button>
              </div>
            )}
          </form>
        </div>
      ) : (
        /* Real-time AI Analysis Result Card */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className={`p-6 text-white ${
            analysisResult.status === 'AI_RESPONDED' 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700' 
              : 'bg-gradient-to-r from-brand-700 to-indigo-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono opacity-80">
                Ticket #{analysisResult.ticket_number}
              </span>
              <AIConfidenceBadge confidence={analysisResult.ai_confidence} />
            </div>
            <h2 className="text-xl font-extrabold mt-2">
              {analysisResult.status === 'AI_RESPONDED' ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                  AI Support has provided a solution!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-amber-300" />
                  Your issue has been forwarded to a human support specialist.
                </span>
              )}
            </h2>
          </div>

          {/* AI Structured Diagnostics Grid */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{analysisResult.category}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Priority</span>
                <div className="mt-1"><PriorityBadge priority={analysisResult.priority} /></div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Severity</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{analysisResult.severity}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sentiment</span>
                <p className={`text-xs font-bold mt-0.5 ${
                  analysisResult.sentiment === 'POSITIVE' ? 'text-emerald-600' : analysisResult.sentiment === 'NEGATIVE' ? 'text-rose-600' : 'text-slate-700'
                }`}>{analysisResult.sentiment}</p>
              </div>
            </div>

            {/* AI Response Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                <Bot className="w-4 h-4 text-brand-600" />
                <span>Recommended Solution & Support Message:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {analysisResult.ai_resolution}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setAnalysisResult(null);
                  setSubject('');
                  setDescription('');
                  setCategory('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Create Another Ticket
              </button>
              <button
                type="button"
                onClick={() => navigate(`/customer/tickets/${analysisResult.id}`)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 transition-all"
              >
                View Full Ticket & Chat <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTicket;
