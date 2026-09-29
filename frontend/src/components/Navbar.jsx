import React from 'react';
import { Sparkles, History, FileText, RefreshCw, Briefcase } from 'lucide-react';

export default function Navbar({ onOpenHistory, onReset, historyCount, onLoadSample, isAnalyzing }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">AI Resume Analyzer</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Job Matcher
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              NLP & Machine Learning Skill Gap Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sample Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Try Sample:
            </span>
            <button
              onClick={() => onLoadSample('full-stack-dev')}
              disabled={isAnalyzing}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-300 font-medium transition cursor-pointer disabled:opacity-50"
            >
              Full Stack
            </button>
            <button
              onClick={() => onLoadSample('ai-ml-engineer')}
              disabled={isAnalyzing}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-violet-600/30 hover:text-violet-300 text-slate-300 font-medium transition cursor-pointer disabled:opacity-50"
            >
              AI / ML
            </button>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-sm font-medium transition cursor-pointer"
            title="View saved analyses in SQLite"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs rounded-full font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Start new analysis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
