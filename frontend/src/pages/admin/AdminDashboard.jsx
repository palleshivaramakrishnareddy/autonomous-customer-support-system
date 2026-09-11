import React, { useState, useEffect } from 'react';
import { dashboardApi, adminApi, ticketsApi } from '../../services/api';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import AIConfidenceBadge from '../../components/AIConfidenceBadge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  Star, 
  Cpu, 
  AlertTriangle,
  TrendingUp,
  Bot
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const SENTIMENT_COLORS = { POSITIVE: '#10b981', NEUTRAL: '#64748b', NEGATIVE: '#ef4444' };

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [catDist, setCatDist] = useState([]);
  const [prioDist, setPrioDist] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [sentimentDist, setSentimentDist] = useState([]);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [recentEscalations, setRecentEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          sResp, tResp, cResp, pResp, stResp, sentResp, dResp, escResp
        ] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getTrends(),
          dashboardApi.getCategoryDist(),
          dashboardApi.getPriorityDist(),
          dashboardApi.getStatusDist(),
          dashboardApi.getSentimentDist(),
          adminApi.getAIDecisions(5),
          ticketsApi.getTickets({ status: 'ESCALATED' })
        ]);

        setStats(sResp.data);
        setTrends(tResp.data);
        setCatDist(cResp.data);
        setPrioDist(pResp.data);
        setStatusDist(stResp.data);
        setSentimentDist(sentResp.data);
        setRecentDecisions(dResp.data);
        setRecentEscalations(escResp.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin analytics', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading system analytics...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Mode indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive AI Operations & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Live telemetry from autonomous multi-agent issue tracking pipeline</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow">
          <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>AI Mode: <strong className="text-brand-400">{stats?.ai_mode || 'FALLBACK'}</strong></span>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total</span>
          <div className="text-xl font-black text-slate-900">{stats?.total_tickets}</div>
          <span className="text-[10px] text-slate-400">Tickets</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Open</span>
          <div className="text-xl font-black text-slate-900">{stats?.open_tickets}</div>
          <span className="text-[10px] text-slate-400">Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Resolved</span>
          <div className="text-xl font-black text-slate-900">{stats?.resolved_tickets}</div>
          <span className="text-[10px] text-slate-400">Completed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">Escalated</span>
          <div className="text-xl font-black text-rose-600">{stats?.escalated_tickets}</div>
          <span className="text-[10px] text-slate-400">To Agents</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">Critical</span>
          <div className="text-xl font-black text-red-700">{stats?.critical_tickets}</div>
          <span className="text-[10px] text-slate-400">Severity</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">AI Resolution</span>
          <div className="text-xl font-black text-purple-600">{stats?.ai_resolution_rate}%</div>
          <span className="text-[10px] text-slate-400">Autonomous</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Avg Resolution</span>
          <div className="text-xl font-black text-slate-900">{stats?.avg_resolution_time_hours}h</div>
          <span className="text-[10px] text-slate-400">Duration</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">CSAT Rating</span>
          <div className="text-xl font-black text-slate-900 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {stats?.avg_customer_rating}
          </div>
          <span className="text-[10px] text-slate-400">Out of 5.0</span>
        </div>
      </div>

      {/* Row 1 Charts: Trends & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume Trends */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ticket Volume & Resolution Trends</h3>
              <p className="text-xs text-slate-400">7-day progression of incoming vs resolved tickets</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} name="Submitted" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                <Line type="monotone" dataKey="escalated" stroke="#f43f5e" strokeWidth={2} name="Escalated" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickets by Category */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tickets by Category</h3>
            <p className="text-xs text-slate-400">Distribution across 12 AI classification classes</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Priority & Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Priority Distribution */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Priority Breakdown</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={prioDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {prioDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Lifecycle Status Breakdown</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Customer Sentiment Analysis</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                  {sentimentDist.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: AI Activity Audit & Recent Escalations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent AI Decisions */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600" /> Recent AI Agent Decisions
            </h3>
            <span className="text-[11px] text-slate-400">Safe reasoning summary</span>
          </div>
          <div className="space-y-3">
            {recentDecisions.map((d) => (
              <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-purple-700">{d.agent_name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round(d.confidence * 100)}% Conf • Ticket #{d.ticket_id}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 mb-0.5">{d.action}</div>
                <p className="text-slate-500 leading-relaxed text-[11px]">{d.reasoning_summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Escalations */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" /> Recent Escalations
            </h3>
            <span className="text-[11px] text-slate-400">Routed to support specialists</span>
          </div>
          <div className="space-y-3">
            {recentEscalations.map((t) => (
              <div key={t.id} className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 text-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-rose-600">{t.ticket_number}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="font-semibold text-slate-800 text-xs truncate max-w-xs">{t.subject}</p>
                  <span className="text-[10px] text-slate-400">
                    Assigned: {t.assigned_agent_name || 'Unassigned'}
                  </span>
                </div>
                <TicketStatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
