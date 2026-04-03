'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function LinkedInOptimizerPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [file, setFile]           = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry]   = useState('');
  const [result, setResult]       = useState<{
    optimized_headline: string;
    optimized_summary: string;
    skill_recommendations: string[];
    keywords_to_include: string[];
    improvements: string[];
  } | null>(null);
  const [loading, setLoading]           = useState(false);
  const [parsing, setParsing]           = useState(false);
  const [error, setError]               = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [authChecked, setAuthChecked]   = useState(false);
  const [dragOver, setDragOver]         = useState(false);

  useEffect(() => {
    const initAuth = async () => { await checkAuth(); setAuthChecked(true); };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) router.push('/login');
  }, [authChecked, isAuthenticated, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type === 'application/pdf') { setFile(f); setError(''); }
    else { setError('Please upload a PDF file'); setFile(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (f.type === 'application/pdf') { setFile(f); setError(''); }
    else { setError('Please upload a PDF file'); }
  };

  const handleOptimize = async () => {
    if (!file)            { setError('Please upload your LinkedIn profile PDF'); return; }
    if (!targetRole.trim()) { setError('Please enter your target role'); return; }
    setLoading(true); setParsing(true); setError(''); setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const parseResponse = await api.post('/api/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const parsedProfile = parseResponse.data.content;
      setParsing(false);
      const optimizeResponse = await api.post('/api/ai/optimize-linkedin', {
        current_profile: parsedProfile,
        target_role: targetRole,
        industry: industry.trim() || null,
      });
      setResult(optimizeResponse.data);
    } catch (err: any) {
      setParsing(false);
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', '));
        } else { setError(err.response.data.detail); }
      } else { setError('Failed to optimize LinkedIn profile'); }
    } finally { setLoading(false); }
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadInstructions = () => {
    const instructions = `How to Download Your LinkedIn Profile as PDF:\n\n1. Go to your LinkedIn profile (linkedin.com/in/your-name)\n2. Click "Resources" in the top section of your profile\n3. Select "Save to PDF"\n4. LinkedIn will generate and download your profile as a PDF file\n5. Upload that PDF here for optimization!\n\nAlternative Method:\n1. Go to Settings & Privacy → Data privacy → Get a copy of your data\n2. Download "Profile" data\n3. LinkedIn will email you a PDF of your profile`;
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'linkedin-pdf-instructions.txt';
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); window.URL.revokeObjectURL(url);
  };

  const CopyBtn = ({ text, section, label = 'Copy' }: { text: string; section: string; label?: string }) => (
    <button
      onClick={() => handleCopy(text, section)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: copiedSection === section ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${copiedSection === section ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
        color:  copiedSection === section ? '#22c55e' : 'rgba(255,255,255,0.55)',
      }}>
      {copiedSection === section ? '✓ Copied!' : `⎘ ${label}`}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <style>{STYLES}</style>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0891b2, transparent 70%)' }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>💼</div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">AI Tool</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">LinkedIn Optimizer</h1>
            <p className="text-white/40 mt-1 text-sm">Upload your LinkedIn PDF and get AI-powered optimization</p>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="text-sm text-white/40 hover:text-white/80 transition-colors">← Dashboard</button>
        </div>

        {/* How-to info card */}
        <div className="glass-card rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>📖</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-1">How to get your LinkedIn profile as PDF</p>
            <ol className="text-sm text-white/50 space-y-0.5 list-none">
              <li>1. Go to your LinkedIn profile → Click <strong className="text-white/70">"Resources"</strong></li>
              <li>2. Select <strong className="text-white/70">"Save to PDF"</strong> — LinkedIn downloads it instantly</li>
              <li>3. Upload that PDF below for AI-powered optimization</li>
            </ol>
          </div>
          <button onClick={handleDownloadInstructions}
            className="shrink-0 text-xs text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg whitespace-nowrap"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            ⬇ Full guide
          </button>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-6 mb-6 space-y-5">

          {/* Drop zone */}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              LinkedIn Profile PDF <span className="text-blue-400">*</span>
            </label>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className="drop-zone relative flex flex-col items-center justify-center gap-3 py-10 rounded-2xl cursor-pointer transition-all"
              style={{
                border: `2px dashed ${dragOver ? 'rgba(59,130,246,0.6)' : file ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
                background: dragOver ? 'rgba(59,130,246,0.05)' : file ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.01)',
              }}>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="sr-only" />
              {file ? (
                <>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>✓</div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">{(file.size / 1024).toFixed(0)} KB · PDF ready</p>
                  </div>
                  <p className="text-xs text-white/30">Click to change file</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>📄</div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white/70">Drop your LinkedIn PDF here</p>
                    <p className="text-xs text-white/35 mt-1">or <span className="text-blue-400 underline">click to browse</span></p>
                  </div>
                  <p className="text-xs text-white/25">PDF only · exported from LinkedIn</p>
                </>
              )}
            </label>
          </div>

          {/* Target role + Industry */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Target Role <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="field w-full bg-transparent text-white/90 text-sm outline-none placeholder-white/25 rounded-xl px-4 py-3"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Industry <span className="text-white/25">(optional)</span>
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="field w-full bg-transparent text-white/90 text-sm outline-none placeholder-white/25 rounded-xl px-4 py-3"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                placeholder="e.g., Technology, Finance"
              />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-400 flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="shrink-0">⚠️</span>{error}
            </div>
          )}

          <button onClick={handleOptimize} disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
            style={{
              background: loading ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa)',
              boxShadow: loading ? 'none' : '0 8px 32px rgba(59,130,246,0.25)',
            }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {parsing ? 'Parsing LinkedIn PDF…' : 'Optimizing your profile…'}
              </span>
            ) : '🚀 Optimize LinkedIn Profile'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5 result-appear">

            {/* Optimized Headline */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Optimized Headline</h2>
                  <p className="text-xs text-white/35 mt-0.5">{result.optimized_headline.length}/220 characters</p>
                </div>
                <CopyBtn text={result.optimized_headline} section="headline" />
              </div>
              <div className="rounded-xl px-5 py-4"
                style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <p className="text-white/90 font-semibold leading-relaxed">{result.optimized_headline}</p>
              </div>
              {/* Char bar */}
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                  style={{ width: `${Math.min((result.optimized_headline.length / 220) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Optimized Summary */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Optimized Summary</h2>
                  <p className="text-xs text-white/35 mt-0.5">{result.optimized_summary.length}/2600 characters</p>
                </div>
                <CopyBtn text={result.optimized_summary} section="summary" />
              </div>
              <div className="rounded-xl px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <pre className="whitespace-pre-wrap font-sans text-sm text-white/75 leading-[1.85]">
                  {result.optimized_summary}
                </pre>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${Math.min((result.optimized_summary.length / 2600) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Skills + Keywords side by side on large screens */}
            <div className="grid md:grid-cols-2 gap-5">

              {/* Skills */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">Recommended Skills</h2>
                    <p className="text-xs text-white/35 mt-0.5">{result.skill_recommendations.length} skills</p>
                  </div>
                  <CopyBtn text={result.skill_recommendations.join(', ')} section="skills" label="Copy all" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.skill_recommendations.map((skill, i) => (
                    <span key={i}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO Keywords */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">SEO Keywords</h2>
                    <p className="text-xs text-white/35 mt-0.5">{result.keywords_to_include.length} keywords</p>
                  </div>
                  <CopyBtn text={result.keywords_to_include.join(', ')} section="keywords" label="Copy all" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords_to_include.map((kw, i) => (
                    <span key={i}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)', color: '#4ade80' }}>
                      {kw}
                    </span>
                  ))}
                </div>
                <div className="mt-4 px-3 py-2.5 rounded-xl flex items-start gap-2"
                  style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <span className="text-indigo-400 text-xs shrink-0 mt-0.5">💡</span>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Use these naturally in your headline, summary, and experience sections to improve recruiter visibility.
                  </p>
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-5">Improvement Suggestions</h2>
              <ol className="space-y-3">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{imp}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Re-optimize */}
            <div className="text-center">
              <button onClick={() => { setResult(null); setFile(null); setTargetRole(''); setIndustry(''); }}
                className="text-sm text-white/35 hover:text-white/60 transition-colors px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                ↺ Start over
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
    border-color: rgba(59,130,246,0.45) !important;
    background: rgba(59,130,246,0.03) !important;
  }
  .drop-zone {
    transition: border-color 0.2s, background 0.2s;
  }
  .drop-zone:hover {
    border-color: rgba(59,130,246,0.4) !important;
    background: rgba(59,130,246,0.03) !important;
  }
  .result-appear {
    animation: resultIn 0.45s cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes resultIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
