import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { Sliders, Cpu, Database, Server, CheckCircle2, Shield } from 'lucide-react';

export const AdminSettings = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const resp = await dashboardApi.getStats();
        setStats(resp.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-brand-600" />
          System & AI Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review autonomous pipeline settings, model adapters, and database health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Engine Status */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Engine Mode</h2>
              <span className="text-[11px] text-slate-400">Multi-agent orchestrator backend</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-600">Active Operational Mode:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                stats?.ai_mode === 'OPENAI'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {stats?.ai_mode || 'FALLBACK'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
              {stats?.ai_mode === 'OPENAI' ? (
                <span>Operating with live OpenAI models. Responses and classifications are generated dynamically using GPT-4o-mini with fallback protection.</span>
              ) : (
                <span>Operating in <strong>Deterministic Fallback Mode</strong>. All 7 agents execute rule-based classification, keyword knowledge lookup, and safe heuristic resolutions without requiring an external API key.</span>
              )}
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              To enable OpenAI mode, set <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">OPENAI_API_KEY</code> in backend <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">.env</code>.
            </div>
          </div>
        </div>

        {/* Database & API Status */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Database & Services</h2>
              <span className="text-[11px] text-slate-400">Storage & API connections</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-600">Database Engine:</span>
              <span className="font-mono text-slate-800 font-semibold">SQLite (SQLAlchemy 2.0)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-600">Backend API:</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> FastAPI REST
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-600">API Documentation:</span>
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-brand-600 hover:text-brand-800"
              >
                /docs (Swagger UI) →
              </a>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-600">Security / Auth:</span>
              <span className="font-mono text-slate-800 font-semibold">JWT HS256 + Bcrypt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
