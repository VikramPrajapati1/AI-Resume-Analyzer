import React from 'react';
import { AlertTriangle, CheckCircle, Info, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

export default function SuggestionsList({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-200">No critical issues detected!</p>
        <p className="text-xs text-slate-500 mt-1">Your resume strongly aligns with the target qualifications.</p>
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Optimization
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <div>
          <h3 className="text-sm font-semibold text-white">AI Resume Improvement Suggestions</h3>
          <p className="text-xs text-slate-400">Targeted adjustments to maximize recruiter and ATS visibility</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono">
                  {index + 1}
                </span>
                {item.title}
              </h4>
              {getPriorityBadge(item.priority)}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-7 mb-3">
              {item.message}
            </p>

            {item.action && (
              <div className="ml-7 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  <strong>Action:</strong> {item.action}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
