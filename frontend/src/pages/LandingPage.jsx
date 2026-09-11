import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Cpu, 
  ShieldAlert,
  Search
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Antigravity AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/30 transition-all"
            >
              Launch Live Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 px-6 text-center max-w-5xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-800 text-brand-400 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Multi-Agent AI Support Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Autonomous AI Customer Support System for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-brand-400 to-indigo-300">
            Issue Tracking & Feedback
          </span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Demonstrating TRUE Agentic AI behavior. A 7-agent pipeline that ingests, classifies, 
          queries knowledge bases, formulates solutions, evaluates escalation risk, and supervises actions 
          in real time with 100% deterministic fallback and OpenAI support.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-brand-600/30 transition-all hover:scale-105"
          >
            Access Live Application <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-all"
          >
            Swagger API Docs
          </a>
        </div>

        {/* Demo Roles Quick Box */}
        <div className="mt-14 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-3xl mx-auto text-left shadow-2xl">
          <p className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">
            One-Click Role Demonstration Accounts:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              to="/login"
              className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-brand-500 transition-all block group"
            >
              <div className="text-xs font-bold text-white group-hover:text-brand-400">Admin Portal</div>
              <div className="text-[11px] text-slate-400">admin@example.com</div>
              <div className="text-[10px] text-slate-500 mt-1">Analytics, Knowledge, Users</div>
            </Link>
            <Link
              to="/login"
              className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-brand-500 transition-all block group"
            >
              <div className="text-xs font-bold text-white group-hover:text-brand-400">Support Agent</div>
              <div className="text-[11px] text-slate-400">agent@example.com</div>
              <div className="text-[10px] text-slate-500 mt-1">Triage, Escalations, Replies</div>
            </Link>
            <Link
              to="/login"
              className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-brand-500 transition-all block group"
            >
              <div className="text-xs font-bold text-white group-hover:text-brand-400">Customer</div>
              <div className="text-[11px] text-slate-400">customer@example.com</div>
              <div className="text-[10px] text-slate-500 mt-1">Submit tickets, AI live resolution</div>
            </Link>
          </div>
        </div>
      </section>

      {/* 7-Agent Architecture Section */}
      <section className="py-16 px-6 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-white">
              True Multi-Agent AI Architecture
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Autonomous 6-Step Loop: Observe → Understand → Plan → Act → Verify → Complete or Escalate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: '1', name: 'Intake Agent', desc: 'Extracts core intent, symptoms, keywords, and urgency clues.' },
              { id: '2', name: 'Classification Agent', desc: 'Predicts category (12 types), priority, severity, sentiment, confidence.' },
              { id: '3', name: 'Knowledge Agent', desc: 'Searches internal database articles using relevance scoring.' },
              { id: '4', name: 'Resolution Agent', desc: 'Synthesizes safe answers; evaluates autonomy feasibility.' },
              { id: '5', name: 'Escalation Agent', desc: 'Detects critical outages, low confidence, and assigns support personnel.' },
              { id: '6', name: 'Feedback Agent', desc: 'Analyzes post-resolution CSAT ratings, sentiment, and recurring issues.' },
              { id: '7', name: 'Supervisor Agent', desc: 'Final safety gatekeeper. Approves autonomous resolution or enforces human review.' },
              { id: '★', name: 'AI Orchestrator', desc: 'Coordinates the entire loop with real-time audit logging.' },
            ].map((ag) => (
              <div key={ag.id} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-sm mb-3">
                  {ag.id}
                </div>
                <h3 className="text-sm font-bold text-white">{ag.name}</h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{ag.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        Autonomous AI Customer Support System • Built with React, Vite, Tailwind CSS, FastAPI, and SQLAlchemy.
      </footer>
    </div>
  );
};

export default LandingPage;
