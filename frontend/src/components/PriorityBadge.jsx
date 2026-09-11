import React from 'react';

const priorityConfig = {
  LOW: { label: 'Low', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  HIGH: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  CRITICAL: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', animate: 'animate-pulse' },
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || 'MEDIUM').toUpperCase();
  const config = priorityConfig[p] || priorityConfig.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${config.bg} ${config.text} ${config.border} ${config.animate || ''}`}
    >
      {config.label}
    </span>
  );
};

export default PriorityBadge;
