import React from 'react';
import { ShieldCheck, Check, AlertCircle, FileText, Zap, BarChart2, Hash } from 'lucide-react';

export default function AtsAuditCard({ atsAudit, contactInfo = {} }) {
  if (!atsAudit) return null;

  const {
    score = 0,
    word_count = 0,
    reading_time_minutes = 1,
    length_status = 'Optimal',
    present_sections = [],
    missing_sections = [],
    action_verbs_count = 0,
    action_verbs = [],
    weak_verbs = [],
    metrics_count = 0
  } = atsAudit;

  const allExpectedSections = [
    { key: 'summary', label: 'Professional Summary' },
    { key: 'experience', label: 'Work Experience' },
    { key: 'skills', label: 'Technical Skills' },
    { key: 'projects', label: 'Projects Showcase' },
    { key: 'education', label: 'Education' },
    { key: 'certifications', label: 'Certifications / Awards' }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">ATS Readability & Structural Audit</h3>
            <p className="text-xs text-slate-400">Applicant Tracking System scanner compatibility report</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-bold text-emerald-400">{score}/100</span>
          <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Health Score</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Word Count */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <FileText className="w-3.5 h-3.5 text-indigo-400" /> Length
          </div>
          <div className="text-lg font-bold text-white">{word_count}</div>
          <span className="text-[11px] text-indigo-300">{length_status}</span>
        </div>

        {/* Read Time */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" /> Read Time
          </div>
          <div className="text-lg font-bold text-white">{reading_time_minutes} min</div>
          <span className="text-[11px] text-slate-500">Recruiter skim time</span>
        </div>

        {/* Action Verbs */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Impact Verbs
          </div>
          <div className="text-lg font-bold text-white">{action_verbs_count}</div>
          <span className="text-[11px] text-emerald-400">Strong verbs used</span>
        </div>

        {/* Quantified Metrics */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Hash className="w-3.5 h-3.5 text-violet-400" /> Metrics (%)
          </div>
          <div className="text-lg font-bold text-white">{metrics_count}</div>
          <span className="text-[11px] text-violet-300">STAR numbers</span>
        </div>
      </div>

      {/* Section Completeness Checklist */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Essential Section Headers
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allExpectedSections.map((sec) => {
            const isPresent = present_sections.includes(sec.key);
            return (
              <div
                key={sec.key}
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isPresent
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                {isPresent ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="truncate">{sec.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Verbs Found */}
      {action_verbs.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
          <span className="text-slate-400 block mb-2">Detected High-Impact Action Verbs:</span>
          <div className="flex flex-wrap gap-1.5">
            {action_verbs.map((verb) => (
              <span key={verb} className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-mono text-[11px]">
                {verb}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak Verbs Warning */}
      {weak_verbs.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong>Passive phrasing detected:</strong> Avoid words like <em>{weak_verbs.join(', ')}</em>. Replace them with specific leadership or engineering verbs.
          </div>
        </div>
      )}
    </div>
  );
}
