import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../../services/api';
import { Star, MessageSquareHeart, Clock } from 'lucide-react';

export const CustomerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const resp = await feedbackApi.getFeedbackList();
        setFeedbacks(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support Feedback History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your satisfaction ratings and comments analyzed by the Feedback Agent.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading feedback...</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareHeart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No feedback submitted yet</p>
            <p className="text-[11px] text-slate-400 mt-1">Rate tickets after they are resolved to help us improve.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-6 space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {fb.ticket_number}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(fb.created_at).toLocaleDateString()}
                  </span>
                </div>
                {fb.comment && (
                  <p className="text-xs text-slate-700 italic">"{fb.comment}"</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sentiment Analysis:</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    fb.sentiment === 'POSITIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : fb.sentiment === 'NEGATIVE'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {fb.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerFeedback;
