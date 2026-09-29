import React, { useState } from 'react';
import { Check, X, Plus, Layers, Sparkles, Copy, CheckCheck } from 'lucide-react';

export default function SkillGapMatrix({ result }) {
  if (!result) return null;

  const {
    matched_skills = [],
    missing_skills = [],
    bonus_skills = [],
    category_breakdown = {},
  } = result;

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'matched', 'missing', 'bonus'
  const [copiedSkill, setCopiedSkill] = useState(null);

  const handleCopySkill = (skill) => {
    navigator.clipboard.writeText(skill);
    setCopiedSkill(skill);
    setTimeout(() => setCopiedSkill(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Skill Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Skills ({matched_skills.length + missing_skills.length + bonus_skills.length})
          </button>

          <button
            onClick={() => setActiveFilter('matched')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'matched'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            <Check className="w-3.5 h-3.5" /> Matched ({matched_skills.length})
          </button>

          <button
            onClick={() => setActiveFilter('missing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'missing'
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
            }`}
          >
            <X className="w-3.5 h-3.5" /> Missing Gap ({missing_skills.length})
          </button>

          <button
            onClick={() => setActiveFilter('bonus')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'bonus'
                ? 'bg-indigo-500 text-white font-bold shadow-sm'
                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Extra / Bonus ({bonus_skills.length})
          </button>
        </div>

        <span className="text-xs text-slate-500 italic">
          Click any missing skill to copy into your resume
        </span>
      </div>

      {/* Skills Badges Grid */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 min-h-[140px]">
        <div className="flex flex-wrap gap-2.5">
          {/* Missing Skills */}
          {(activeFilter === 'all' || activeFilter === 'missing') &&
            missing_skills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleCopySkill(skill)}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition cursor-pointer shadow-sm hover:scale-105"
                title="Missing in your resume! Click to copy keyword"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>{skill}</span>
                {copiedSkill === skill ? (
                  <CheckCheck className="w-3 h-3 text-emerald-400 ml-1" />
                ) : (
                  <Copy className="w-3 h-3 text-rose-400/50 group-hover:text-rose-300 ml-0.5 opacity-0 group-hover:opacity-100 transition" />
                )}
              </button>
            ))}

          {/* Matched Skills */}
          {(activeFilter === 'all' || activeFilter === 'matched') &&
            matched_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {skill}
              </span>
            ))}

          {/* Bonus Skills */}
          {(activeFilter === 'all' || activeFilter === 'bonus') &&
            bonus_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {skill}
              </span>
            ))}

          {activeFilter === 'missing' && missing_skills.length === 0 && (
            <div className="w-full text-center py-6 text-sm text-emerald-400">
              🎉 Outstanding! Zero missing skills detected for this role.
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Progress */}
      {Object.keys(category_breakdown).length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Skill Alignment by Domain</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(category_breakdown).map(([category, stats]) => {
              const pct = stats.percentage;
              let barColor = 'bg-emerald-500';
              if (pct < 40) barColor = 'bg-rose-500';
              else if (pct < 70) barColor = 'bg-amber-500';

              return (
                <div key={category} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-200">{category}</span>
                    <span className="text-slate-400">
                      <strong className="text-white">{stats.matched_count}</strong> / {stats.required_count} ({pct}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Mini pills */}
                  <div className="flex flex-wrap gap-1 text-[11px] pt-1">
                    {stats.matched.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {s}
                      </span>
                    ))}
                    {stats.missing.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">
                        +{s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
