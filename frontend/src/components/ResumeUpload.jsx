import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Mail, Phone, Globe, Code2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function ResumeUpload({
  resumeText,
  setResumeText,
  resumeData,
  setResumeData,
  onUploadSuccess,
  isUploading,
  setIsUploading
}) {
  const [mode, setMode] = useState('upload'); // 'upload' or 'paste'
  const [dragActive, setDragActive] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload and parse resume');
      }

      const data = await response.json();
      setResumeData(data);
      setResumeText(data.extracted_text);
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err) {
      setUploadError(err.message || 'Error parsing PDF. Please try again or paste text directly.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header & Mode Switch */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">1. Your Resume</h2>
            <p className="text-xs text-slate-400">PDF extract or paste raw text</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
              mode === 'upload'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PDF Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
              mode === 'paste'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Main Mode Body */}
      {mode === 'upload' ? (
        <div className="flex-1 flex flex-col">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px] ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700/80 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-indigo-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Extracting PDF text & detecting skills...</span>
              </div>
            ) : resumeData?.filename ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">{resumeData.filename}</span>
                <span className="text-xs text-slate-400">
                  {resumeData.word_count} words extracted • Click to replace PDF
                </span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-indigo-400/80 mb-2" />
                <p className="text-sm font-medium text-slate-200">
                  Drag and drop your PDF resume here, or <span className="text-indigo-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Supports standard PDF or TXT formats</p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Extracted Metadata Summary */}
          {resumeData && (
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Detected Contact Info:</span>
                <span className="text-indigo-400 font-medium">
                  {Object.values(resumeData.contact_info || {}).filter(Boolean).length} points found
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {resumeData.contact_info?.email && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <Mail className="w-3 h-3 text-emerald-400" /> {resumeData.contact_info.email}
                  </span>
                )}
                {resumeData.contact_info?.phone && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <Phone className="w-3 h-3 text-blue-400" /> {resumeData.contact_info.phone}
                  </span>
                )}
                {resumeData.contact_info?.linkedin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <Globe className="w-3 h-3 text-sky-400" /> LinkedIn
                  </span>
                )}
                {resumeData.contact_info?.github && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <Code2 className="w-3 h-3 text-purple-400" /> GitHub
                  </span>
                )}
              </div>

              {/* Toggle Raw Text Inspector */}
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="w-full pt-1 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer border-t border-slate-800/50"
              >
                <span>Preview Extracted Text</span>
                {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showRawText && (
                <div className="max-h-48 overflow-y-auto p-2.5 rounded bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-800">
                  {resumeText}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Textarea Paste Mode */
        <div className="flex-1 flex flex-col">
          <label htmlFor="resume-paste-text" className="sr-only">Resume Text</label>
          <textarea
            id="resume-paste-text"
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              // Clear previous file reference if user edits directly
              if (resumeData) setResumeData({ ...resumeData, extracted_text: e.target.value });
            }}
            placeholder="Paste your full resume text here (include Experience, Education, Projects, Skills, etc.)..."
            className="w-full flex-1 min-h-[220px] p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 resize-none font-mono leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>{resumeText ? `${resumeText.trim().split(/\s+/).length} words` : '0 words'}</span>
            <span>Paste your latest resume draft</span>
          </div>
        </div>
      )}
    </div>
  );
}
