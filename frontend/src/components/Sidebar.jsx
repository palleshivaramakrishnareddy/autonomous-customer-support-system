import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  MessageSquareHeart,
  User,
  ShieldAlert,
  Users,
  Cpu,
  BookOpen,
  RefreshCw,
  Sliders,
  LifeBuoy
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/customer/tickets/new', label: 'Create Ticket', icon: PlusCircle },
    { to: '/customer/feedback', label: 'Feedback', icon: MessageSquareHeart },
    { to: '/customer/profile', label: 'Profile', icon: User },
  ];

  const agentLinks = [
    { to: '/agent/dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
    { to: '/agent/tickets', label: 'Assigned Tickets', icon: Ticket },
    { to: '/agent/escalations', label: 'Escalations Queue', icon: ShieldAlert },
    { to: '/agent/profile', label: 'Agent Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Analytics', icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'Ticket Oversight', icon: Ticket },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/ai-activity', label: 'AI Decisions Audit', icon: Cpu },
    { to: '/admin/feedback', label: 'Customer Sentiment', icon: MessageSquareHeart },
    { to: '/admin/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/admin/recurring-issues', label: 'Recurring Issues', icon: RefreshCw },
    { to: '/admin/settings', label: 'AI & System Config', icon: Sliders },
  ];

  let links = customerLinks;
  if (role === 'SUPPORT_AGENT') links = agentLinks;
  if (role === 'ADMIN') links = adminLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 border-r border-slate-800">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {role === 'ADMIN' ? 'Administration' : role === 'SUPPORT_AGENT' ? 'Agent Workspace' : 'Customer Portal'}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Autonomous AI status badge */}
      <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
        <div className="flex items-center gap-2 mb-1 text-slate-200 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Autonomous AI Engine
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          7-Agent Loop active: Intake, Classification, Knowledge, Resolution, Escalation, Feedback, Supervisor.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
