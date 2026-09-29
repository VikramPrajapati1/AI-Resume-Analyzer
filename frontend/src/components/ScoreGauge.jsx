import React from 'react';
import { Award, CheckCircle, Brain, FileCheck, Download, Printer } from 'lucide-react';

export default function ScoreGauge({ result, onExportJson, onPrint }) {
  if (!result) return null;

  const {
    match_score = 0,
    match_tier = 'Analysis Complete',
    tier_color = 'emerald',
    skill_score = 0,
    semantic_score = 0,
    ats_score = 0,
    matched_skills = [],
    missing_skills = [],
    job_total_skills = 0,
  } = result;

  // Determine stroke color for the radial circle
  let strokeColor = '#10b981'; // emerald
  let bgColor = 'text-emerald-400';
  let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (match_score < 45) {
    strokeColor = '#f43f5e'; // rose
    bgColor = 'text-rose-400';
    badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (match_score < 70) {
    strokeColor = '#f59e0b'; // amber
    bgColor = 'text-amber-400';
    badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (match_score < 85) {
    strokeColor = '#3b82f6'; // blue
    bgColor = 'text-blue-400';
    badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }

  // SVG Circular math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (match_score / 100) * circumference;

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left: Radial Score Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-800"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress animated circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>

            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold tracking-tight ${bgColor}`}>
                {match_score}%
              </span>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Match Score
              </span>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-2 uppercase tracking-wider"
              style={{
                borderColor: `${strokeColor}40`,
                backgroundColor: `${strokeColor}15`,
                color: strokeColor,
              }}
            >
              <Award className="w-3.5 h-3.5" />
              {match_tier}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {result.job_title || 'Target Job Match'}
            </h1>
            <p className="text-sm text-slate-400 max-w-md mt-1">
              Resume matches {matched_skills.length} out of {job_total_skills} detected job skills. Follow our recommendations below to close the gap.
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4">
              {onExportJson && (
                <button
                  onClick={onExportJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
              )}
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sub-scores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Skill Overlap */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 min-w-[150px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Skill Overlap
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{skill_score}%</div>
            <p className="text-[11px] text-slate-400 mt-1">
              {matched_skills.length} matched / {missing_skills.length} missing
            </p>
          </div>

          {/* Semantic Similarity */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 min-w-[150px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-violet-400" /> Semantic Fit
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{semantic_score}%</div>
            <p className="text-[11px] text-slate-400 mt-1">TF-IDF Vector Match</p>
          </div>

          {/* ATS Health */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 min-w-[150px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> ATS Health
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{ats_score}%</div>
            <p className="text-[11px] text-slate-400 mt-1">
              {result.ats_audit?.length_status || 'Structure Valid'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
