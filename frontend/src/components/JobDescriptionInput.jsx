import React from 'react';
import { Target, Building, Sparkles } from 'lucide-react';

export default function JobDescriptionInput({
  jobTitle,
  setJobTitle,
  company,
  setCompany,
  jobDescription,
  setJobDescription,
  onQuickFillSample
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">2. Target Job Description</h2>
            <p className="text-xs text-slate-400">Role specifications & required qualifications</p>
          </div>
        </div>

        {/* Quick Fill Dropdown / Badge */}
        {onQuickFillSample && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onQuickFillSample('full-stack-dev')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              Stripe JD
            </button>
            <button
              type="button"
              onClick={() => onQuickFillSample('ai-ml-engineer')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              DeepMind JD
            </button>
          </div>
        )}
      </div>

      {/* Inputs for Title and Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="job-title-input" className="block text-xs font-medium text-slate-400 mb-1">
            Job Title <span className="text-indigo-400">*</span>
          </label>
          <input
            id="job-title-input"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
          />
        </div>

        <div>
          <label htmlFor="company-name-input" className="block text-xs font-medium text-slate-400 mb-1">
            Company (Optional)
          </label>
          <div className="relative">
            <input
              id="company-name-input"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, Google, Startup"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
            />
            <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Job Description Textarea */}
      <div className="flex-1 flex flex-col">
        <label htmlFor="job-description-text" className="block text-xs font-medium text-slate-400 mb-1">
          Job Description & Qualifications <span className="text-indigo-400">*</span>
        </label>
        <textarea
          id="job-description-text"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the complete job post (Responsibilities, Requirements, Tech Stack, Preferred Qualifications)..."
          className="w-full flex-1 min-h-[170px] p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 resize-none font-sans leading-relaxed"
        />
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>{jobDescription ? `${jobDescription.trim().split(/\s+/).length} words` : '0 words'}</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-emerald-400" /> NLP engine will detect required skills automatically
          </span>
        </div>
      </div>
    </div>
  );
}
