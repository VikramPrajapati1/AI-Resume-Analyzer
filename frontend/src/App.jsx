import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  FileCheck2,
  Target,
  BarChart3,
  Layers,
  Lightbulb,
  FileSignature,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

import Navbar from './components/Navbar';
import ResumeUpload from './components/ResumeUpload';
import JobDescriptionInput from './components/JobDescriptionInput';
import ScoreGauge from './components/ScoreGauge';
import SkillGapMatrix from './components/SkillGapMatrix';
import SuggestionsList from './components/SuggestionsList';
import TailoredBullets from './components/TailoredBullets';
import AtsAuditCard from './components/AtsAuditCard';
import HistoryModal from './components/HistoryModal';

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [analysisError, setAnalysisError] = useState(null);

  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'suggestions', 'bullets', 'ats'
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  // Fetch initial history count
  const refreshHistoryCount = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryCount(data.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshHistoryCount();
  }, []);

  // Quick load pre-configured sample profile
  const handleLoadSample = async (profileId) => {
    try {
      const res = await fetch('/api/samples');
      if (res.ok) {
        const profiles = await res.json();
        const selected = profiles.find((p) => p.id === profileId) || profiles[0];
        if (selected) {
          setResumeText(selected.resume_text.trim());
          setResumeData({
            filename: `${selected.id}-sample-resume.pdf`,
            word_count: selected.resume_text.trim().split(/\s+/).length,
            extracted_text: selected.resume_text.trim(),
            contact_info: { email: 'sample.dev@example.com', linkedin: 'linkedin.com/in/sample' },
            sections: {}
          });
          setJobTitle(selected.target_job);
          setCompany(selected.company);
          setJobDescription(selected.job_description.trim());
          setAnalysisError(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Perform full matching analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setAnalysisError('Please upload a resume or paste your resume text first.');
      return;
    }
    if (!jobDescription.trim()) {
      setAnalysisError('Please provide a target job description to match against.');
      return;
    }

    setAnalysisError(null);
    setIsAnalyzing(true);
    setAnalyzingStep('Scanning resume text and extracting sections...');

    try {
      setTimeout(() => setAnalyzingStep('Detecting technical & soft skills from taxonomy...'), 300);
      setTimeout(() => setAnalyzingStep('Computing TF-IDF vector semantic similarity...'), 600);
      setTimeout(() => setAnalyzingStep('Running ATS audit and calculating skill gap...'), 900);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_id: resumeData?.resume_id || null,
          resume_text: resumeText,
          job_description: jobDescription,
          job_title: jobTitle || 'Target Role',
          company: company || ''
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Analysis failed. Please check inputs.');
      }

      const data = await response.json();
      setResult(data);
      refreshHistoryCount();

      // Scroll smoothly to results
      setTimeout(() => {
        const resultsEl = document.getElementById('analysis-results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setAnalysisError(err.message || 'Error occurred while analyzing resume.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStep('');
    }
  };

  const handleReset = () => {
    setResumeText('');
    setResumeData(null);
    setJobTitle('');
    setCompany('');
    setJobDescription('');
    setResult(null);
    setAnalysisError(null);
  };

  const handleLoadHistoryItem = (item) => {
    setJobTitle(item.job_title || '');
    setCompany(item.company || '');
    setJobDescription(item.job_description || '');
    if (item.resume_text) {
      setResumeText(item.resume_text);
      setResumeData({
        filename: item.resume_filename || 'Saved Resume',
        word_count: item.resume_text.split(/\s+/).length,
        extracted_text: item.resume_text,
      });
    }
    setResult(item);
  };

  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analysis-${jobTitle || 'report'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenHistory={() => setHistoryOpen(true)}
        onReset={handleReset}
        historyCount={historyCount}
        onLoadSample={handleLoadSample}
        isAnalyzing={isAnalyzing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI-Powered Career Intelligence
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            AI Resume Analyzer <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              & Job Skill Matcher
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Upload your resume and paste a job description. Our Machine Learning & NLP engine extracts 1,000+ technical skills, computes exact gap analysis, ATS compliance, and generates role-tailored bullet points.
          </p>
        </div>

        {/* Dual Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <ResumeUpload
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumeData={resumeData}
            setResumeData={setResumeData}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />

          <JobDescriptionInput
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            company={company}
            setCompany={setCompany}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onQuickFillSample={handleLoadSample}
          />
        </div>

        {/* Error Alert */}
        {analysisError && (
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{analysisError}</span>
          </div>
        )}

        {/* Action Trigger Button */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || isUploading}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 hover:from-indigo-500 hover:via-violet-500 hover:to-emerald-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{analyzingStep || 'Analyzing Match...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition" />
                <span>Analyze Resume & Match Job</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </>
            )}
          </button>
          <span className="text-xs text-slate-500">
            Fast, secure, and stored in local SQLite database
          </span>
        </div>

        {/* Results Dashboard */}
        {result && (
          <div id="analysis-results" className="space-y-8 pt-6 border-t border-slate-800/80">
            {/* Top Score Gauge Card */}
            <ScoreGauge
              result={result}
              onExportJson={handleExportJson}
              onPrint={handlePrint}
            />

            {/* Dashboard Tabs */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'skills'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Skill Gap Matrix</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-xs">
                    {result.matched_skills?.length || 0} / {result.job_total_skills || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'suggestions'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>AI Suggestions</span>
                  {result.suggestions?.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                      {result.suggestions.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('bullets')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'bullets'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Role-Tailored Bullets</span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold">
                    AI
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('ats')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'ats'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ATS & Structural Audit</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    {result.ats_score}%
                  </span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="pt-2">
                {activeTab === 'skills' && <SkillGapMatrix result={result} />}

                {activeTab === 'suggestions' && (
                  <SuggestionsList suggestions={result.suggestions} />
                )}

                {activeTab === 'bullets' && (
                  <TailoredBullets
                    bullets={result.tailored_bullets}
                    jobTitle={jobTitle || 'Target Role'}
                    matchedSkills={result.matched_skills}
                    missingSkills={result.missing_skills}
                  />
                )}

                {activeTab === 'ats' && (
                  <AtsAuditCard
                    atsAudit={result.ats_audit}
                    contactInfo={result.contact_info}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <p>
          AI Resume Analyzer & Job Matcher • Built with React, Tailwind CSS, Python FastAPI, NLP, and SQLite.
        </p>
      </footer>

      {/* SQLite History Modal */}
      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoadHistoryItem={handleLoadHistoryItem}
      />
    </div>
  );
}
