import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../../services/api';
import { MessageSquareHeart, Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export const AdminFeedback = () => {
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

  const total = feedbacks.length;
  const avg = total > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1) : 0;
  const positive = feedbacks.filter((f) => f.sentiment === 'POSITIVE').length;
  const neutral = feedbacks.filter((f) => f.sentiment === 'NEUTRAL').length;
  const negative = feedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquareHeart className="w-6 h-6 text-pink-600" />
          Customer Feedback & Sentiment Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          CSAT ratings, sentiment breakdown, and reviews monitored by the Feedback Agent
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average CSAT</span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> {avg}
          </div>
          <span className="text-[10px] text-slate-400">{total} reviews collected</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Positive Reviews</span>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <ThumbsUp className="w-5 h-5" /> {positive}
          </div>
          <span className="text-[10px] text-slate-400">{total > 0 ? Math.round(positive / total * 100) : 0}% of total</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Neutral Reviews</span>
          <div className="text-2xl font-black text-slate-700 flex items-center gap-1.5">
            <Minus className="w-5 h-5" /> {neutral}
          </div>
          <span className="text-[10px] text-slate-400">{total > 0 ? Math.round(neutral / total * 100) : 0}% of total</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">Negative Reviews</span>
          <div className="text-2xl font-black text-rose-600 flex items-center gap-1.5">
            <ThumbsDown className="w-5 h-5" /> {negative}
          </div>
          <span className="text-[10px] text-slate-400">Triggered admin alerts</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Customer Reviews & Complaints</h2>
          <p className="text-xs text-slate-400 mt-0.5">Chronological sentiment feed with ticket references</p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading reviews...</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No feedback entries found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-5 space-y-2 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-xs">{fb.customer_name || 'Customer'}</span>
                    <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {fb.ticket_number}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(fb.created_at).toLocaleDateString()}
                  </span>
                </div>

                {fb.comment && (
                  <p className="text-xs text-slate-700 italic">"{fb.comment}"</p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sentiment Tag:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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

export default AdminFeedback;
