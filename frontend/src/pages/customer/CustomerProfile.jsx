import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export const CustomerProfile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Your registered customer account information</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-600/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
              <User className="w-3.5 h-3.5" /> Full Name
            </div>
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </div>
            <p className="text-sm font-bold text-slate-800">{user?.email}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
              <Shield className="w-3.5 h-3.5" /> System Role
            </div>
            <p className="text-sm font-bold text-brand-600">{user?.role}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
              <Calendar className="w-3.5 h-3.5" /> Joined Date
            </div>
            <p className="text-sm font-bold text-slate-800">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
