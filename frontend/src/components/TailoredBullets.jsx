import React, { useState } from 'react';
import { Sparkles, Copy, CheckCheck, RefreshCw, FileSignature } from 'lucide-react';

export default function TailoredBullets({
  bullets = [],
  jobTitle = 'Target Role',
  matchedSkills = [],
  missingSkills = [],
  onRefreshBullets
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentBullets, setCurrentBullets] = useState(bullets);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/ai-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: jobTitle,
          matched_skills: matchedSkills,
          missing_skills: missingSkills
        })
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentBullets(data.tailored_bullets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const displayBullets = currentBullets?.length ? currentBullets : bullets;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Role-Tailored Bullet Points</h3>
            <p className="text-xs text-slate-400">
              Ready-to-use bullet points engineered to close your skill gap for {jobTitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>
      </div>

      <div className="space-y-3">
        {displayBullets.map((bullet, idx) => (
          <div
            key={idx}
            className="group p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-violet-500/40 transition flex items-start justify-between gap-3"
          >
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {bullet}
            </p>
            <button
              onClick={() => handleCopy(bullet, idx)}
              className="shrink-0 p-2 rounded-lg bg-slate-900 hover:bg-violet-600/30 text-slate-400 hover:text-violet-300 transition cursor-pointer"
              title="Copy to clipboard"
            >
              {copiedIndex === idx ? (
                <CheckCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
        <FileSignature className="w-4 h-4 shrink-0 text-violet-400" />
        <span>
          <strong>Pro-Tip:</strong> Copy these tailored bullet points into your "Experience" or "Key Projects" section to demonstrate immediate qualification for this role.
        </span>
      </div>
    </div>
  );
}
