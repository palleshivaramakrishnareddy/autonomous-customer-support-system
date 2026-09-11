import React from 'react';

export const AIConfidenceBadge = ({ confidence }) => {
  const score = Math.round((confidence || 0) * 100);

  let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let barColor = 'bg-emerald-500';

  if (score < 75) {
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
    barColor = 'bg-rose-500';
  } else if (score < 85) {
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    barColor = 'bg-amber-500';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span>{score}% AI Confidence</span>
    </div>
  );
};

export default AIConfidenceBadge;
