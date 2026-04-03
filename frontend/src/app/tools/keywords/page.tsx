'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const KEYWORD_CATEGORIES = [
  { label: 'Technical Skills', color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)' },
  { label: 'Soft Skills',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)'  },
  { label: 'Tools',            color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  { label: 'Domain',           color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.25)' },
];

export default function KeywordExtractorPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [jobDescription, setJobDescription]   = useState('');
  const [keywords, setKeywords]               = useState<string[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [authChecked, setAuthChecked]         = useState(false);
  const [copiedKw, setCopiedKw]               = useState<string | null>(null);
  const [copiedAll, setCopiedAll]             = useState(false);

  useEffect(() => {
    const initAuth = async () => { await checkAuth(); setAuthChecked(true); };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) router.push('/login');
  }, [authChecked, isAuthenticated, router]);

  const handleExtract = async () => {
    if (!jobDescription.trim()) { setError('Please enter a job description'); return; }
    setLoading(true); setError(''); setKeywords([]);
    try {
      const response = await api.post('/api/ai/extract-keywords', { job_description: jobDescription });
      setKeywords(response.data.keywords);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to extract keywords');
    } finally {
      setLoading(false);
    }
  };

  const copyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(keywords.join(', '));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <style>{STYLES}</style>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>🔑</div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">AI Tool</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Keyword Extractor</h1>
            <p className="text-white/40 mt-1 text-sm">Pull exact skills &amp; requirements recruiters look for</p>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="text-sm text-white/40 hover:text-white/80 transition-colors flex items-center gap-1">
            ← Dashboard
          </button>
        </div>

        {/* Input card */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            className="textarea w-full bg-transparent text-white/90 text-sm leading-relaxed resize-none outline-none placeholder-white/20 rounded-xl p-4"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
            placeholder="Paste the full job description here…"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-white/25">{jobDescription.length} characters</span>
            {jobDescription.length > 0 && (
              <button onClick={() => setJobDescription('')}
                className="text-xs text-white/30 hover:text-white/60 transition-colors">Clear</button>
            )}
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button onClick={handleExtract} disabled={loading}
            className="mt-5 w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
            style={{ background: loading ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Extracting Keywords…
              </span>
            ) : '🔍 Extract Keywords'}
          </button>
        </div>

        {/* Results */}
        {keywords.length > 0 && (
          <div className="glass-card rounded-2xl p-6 result-appear">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Extracted Keywords
                  <span className="ml-2 text-sm font-normal text-emerald-400">({keywords.length} found)</span>
                </h2>
                <p className="text-xs text-white/35 mt-0.5">Click any keyword to copy it</p>
              </div>
              <button onClick={copyAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: copiedAll ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: copiedAll ? '#22c55e' : 'rgba(255,255,255,0.6)' }}>
                {copiedAll ? '✓ Copied all!' : '⎘ Copy all'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => {
                const cat = KEYWORD_CATEGORIES[i % KEYWORD_CATEGORIES.length];
                const isCopied = copiedKw === keyword;
                return (
                  <button key={i} onClick={() => copyKeyword(keyword)}
                    className="keyword-chip px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
                    style={{
                      background:   isCopied ? 'rgba(34,197,94,0.2)' : cat.bg,
                      border:       `1px solid ${isCopied ? 'rgba(34,197,94,0.4)' : cat.border}`,
                      color:        isCopied ? '#22c55e' : cat.color,
                    }}>
                    {isCopied ? `✓ ${keyword}` : keyword}
                  </button>
                );
              })}
            </div>

            {/* Tip */}
            <div className="mt-6 px-4 py-3 rounded-xl flex items-start gap-3"
              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <span className="text-indigo-400 shrink-0 mt-0.5">💡</span>
              <p className="text-sm text-white/50 leading-relaxed">
                Add these keywords naturally into your resume to improve your ATS score.
                Focus on the ones that appear multiple times in the job description.
              </p>
            </div>

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Keywords found', value: keywords.length, color: '#22c55e' },
                { label: 'Avg length',     value: Math.round(keywords.reduce((a, k) => a + k.length, 0) / keywords.length) + ' chars', color: '#6366f1' },
                { label: 'Top match',      value: keywords[0] ?? '—', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-bold text-sm truncate" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const STYLES = `
  .glass-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(16px);
  }
  .textarea:focus {
    border-color: rgba(34,197,94,0.4) !important;
    background: rgba(34,197,94,0.03) !important;
    transition: border-color 0.2s, background 0.2s;
  }
  .keyword-chip { cursor: pointer; }
  .result-appear {
    animation: resultIn 0.4s cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes resultIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
