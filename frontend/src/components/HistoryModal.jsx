import React, { useEffect, useState } from 'react';
import { X, History, Trash2, ExternalLink, Calendar, Building, Award, Loader2 } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, onLoadHistoryItem }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      setError('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistoryList(historyList.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`);
      if (res.ok) {
        const fullDetail = await res.json();
        onLoadHistoryItem(fullDetail);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Saved Analyses History</h3>
              <p className="text-xs text-slate-400">Stored locally in SQLite database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs">Loading saved analyses from SQLite...</span>
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No saved analyses yet. Upload a resume and match a job to create your first report!
            </div>
          ) : (
            historyList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/50 transition cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition truncate">
                      {item.job_title || 'Target Role'}
                    </h4>
                    {item.company && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" /> {item.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {item.created_at}
                    </span>
                    {item.resume_filename && (
                      <span className="truncate max-w-[150px]">
                        📄 {item.resume_filename}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Score pill */}
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-400">
                      {item.match_score}%
                    </div>
                    <div className="text-[10px] text-slate-500">Match</div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
