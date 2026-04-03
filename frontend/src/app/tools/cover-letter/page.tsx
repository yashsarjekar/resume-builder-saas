'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function CoverLetterPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeContent, setResumeContent]   = useState('');
  const [companyName, setCompanyName]       = useState('');
  const [hiringManager, setHiringManager]   = useState('');
  const [coverLetter, setCoverLetter]       = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [copied, setCopied]                 = useState(false);
  const [authChecked, setAuthChecked]       = useState(false);

  useEffect(() => {
    const initAuth = async () => { await checkAuth(); setAuthChecked(true); };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) router.push('/login');
  }, [authChecked, isAuthenticated, router]);

  const handleGenerate = async () => {
    if (!jobDescription.trim() || !resumeContent.trim() || !companyName.trim()) {
      setError('Please fill in job description, resume content, and company name');
      return;
    }
    setLoading(true); setError(''); setCoverLetter('');
    try {
      let resumeData;
      try { resumeData = JSON.parse(resumeContent); }
      catch {
        resumeData = {
          personalInfo: { name: '', email: '', phone: '', location: '' },
          summary: resumeContent, experience: [], education: [], skills: []
        };
      }
      const response = await api.post('/api/ai/generate-cover-letter', {
        job_description: jobDescription,
        resume_content: resumeData,
        company_name: companyName,
        hiring_manager: hiringManager.trim() || null,
        tone: 'professional'
      });
      setCoverLetter(response.data.cover_letter);
    } catch (err: any) {
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', '));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Failed to generate cover letter');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'cover-letter.txt';
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); window.URL.revokeObjectURL(url);
  };

  const wordCount = coverLetter.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <style>{STYLES}</style>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>📝</div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">AI Tool</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Cover Letter Generator</h1>
            <p className="text-white/40 mt-1 text-sm">Personalized, professional letters generated in seconds</p>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="text-sm text-white/40 hover:text-white/80 transition-colors">
            ← Dashboard
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
          {['Job Description', 'Your Resume', 'Company Details', 'Generate'].map((s, i) => (
            <div key={s} className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b' }}>
                  {i + 1}
                </div>
                <span className="text-xs text-white/50">{s}</span>
              </div>
              {i < 3 && <div className="w-8 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Form grid */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">

          {/* Job Description */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-400 text-sm">📋</span>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Job Description <span className="text-amber-400">*</span>
              </label>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={9}
              className="field w-full bg-transparent text-white/90 text-sm leading-relaxed resize-none outline-none placeholder-white/20 rounded-xl p-3"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              placeholder="Paste the job description here…"
            />
            <p className="text-xs text-white/25 mt-1.5 text-right">{jobDescription.length} chars</p>
          </div>

          {/* Resume */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-indigo-400 text-sm">📄</span>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Your Resume Summary <span className="text-amber-400">*</span>
              </label>
            </div>
            <textarea
              value={resumeContent}
              onChange={(e) => setResumeContent(e.target.value)}
              rows={9}
              className="field w-full bg-transparent text-white/90 text-sm leading-relaxed resize-none outline-none placeholder-white/20 rounded-xl p-3"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              placeholder="Paste your resume or professional summary…"
            />
            <p className="text-xs text-white/25 mt-1.5 text-right">{resumeContent.length} chars</p>
          </div>
        </div>

        {/* Company details row */}
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-emerald-400 text-sm">🏢</span>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Company Name <span className="text-amber-400">*</span>
              </label>
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="field w-full bg-transparent text-white/90 text-sm outline-none placeholder-white/20 rounded-xl px-3 py-2.5"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              placeholder="e.g., Google, Flipkart, Infosys"
            />
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-purple-400 text-sm">👤</span>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Hiring Manager <span className="text-white/25">(optional)</span>
              </label>
            </div>
            <input
              type="text"
              value={hiringManager}
              onChange={(e) => setHiringManager(e.target.value)}
              className="field w-full bg-transparent text-white/90 text-sm outline-none placeholder-white/20 rounded-xl px-3 py-2.5"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              placeholder="e.g., Priya Sharma"
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-red-400 flex items-start gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span className="shrink-0">⚠️</span>{error}
          </div>
        )}

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base mb-8 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] hover:shadow-2xl"
          style={{
            background: loading
              ? 'rgba(245,158,11,0.3)'
              : 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)',
            boxShadow: loading ? 'none' : '0 8px 32px rgba(245,158,11,0.25)',
          }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating your cover letter…
            </span>
          ) : '✨ Generate Cover Letter'}
        </button>

        {/* Result */}
        {coverLetter && (
          <div className="glass-card rounded-2xl p-6 result-appear">
            {/* Result header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Your Cover Letter</h2>
                <p className="text-xs text-white/35 mt-0.5">{wordCount} words · ready to use</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: copied ? '#22c55e' : 'rgba(255,255,255,0.6)',
                  }}>
                  {copied ? '✓ Copied!' : '⎘ Copy'}
                </button>
                <button onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
                  ⬇ Download
                </button>
              </div>
            </div>

            {/* Letter body */}
            <div className="rounded-xl p-5 leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <pre className="whitespace-pre-wrap font-sans text-sm text-white/80 leading-[1.85]">
                {coverLetter}
              </pre>
            </div>

            {/* Quick actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => { setCoverLetter(''); setJobDescription(''); setResumeContent(''); setCompanyName(''); setHiringManager(''); }}
                className="text-xs text-white/35 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                ↺ Start over
              </button>
              <button onClick={handleGenerate}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                ⟳ Regenerate
              </button>
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
  .field {
    transition: border-color 0.2s, background 0.2s;
  }
  .field:focus {
    border-color: rgba(245,158,11,0.45) !important;
    background: rgba(245,158,11,0.03) !important;
  }
  .result-appear {
    animation: resultIn 0.45s cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes resultIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
