'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface SessionSummary {
  id:                 number;
  job_role:           string | null;
  status:             string;
  overall_score:      number | null;
  readiness_level:    string | null;
  readiness_label:    string;
  questions_answered: number;
  created_at:         string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const READINESS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  confident:       { color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/30', icon: '🏆' },
  interview_ready: { color: 'text-blue-300',    bg: 'bg-blue-500/20 border-blue-500/30',       icon: '✅' },
  needs_work:      { color: 'text-amber-300',   bg: 'bg-amber-500/20 border-amber-500/30',     icon: '⚡' },
  not_ready:       { color: 'text-red-300',     bg: 'bg-red-500/20 border-red-500/30',         icon: '📚' },
};

const FEATURE_CARDS = [
  { icon: '🎯', title: 'Personalised Questions', desc: 'Generated from your actual resume + the job description' },
  { icon: '🤖', title: 'Instant AI Scoring',     desc: 'Every answer scored 0-10 with specific, actionable feedback' },
  { icon: '📊', title: 'Readiness Report',       desc: 'Overall score, category breakdown, and top improvements' },
];

const FLOATING_QUESTIONS = [
  'Tell me about yourself.',
  'Why do you want to join TCS?',
  'Explain a challenging bug you solved.',
  'How do you handle tight deadlines?',
  'What is your greatest strength?',
];

// ── Floating 3D question card ──────────────────────────────────────────────

function FloatingCard({ text, style }: { text: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute glass-card rounded-xl px-4 py-3 text-sm text-gray-300 max-w-[200px] shadow-xl pointer-events-none"
      style={{
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(99,102,241,0.25)',
        ...style,
      }}
    >
      <span className="text-indigo-400 mr-1.5">Q:</span>{text}
    </div>
  );
}

// ── Score ring ─────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r   = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(score, 100) / 100;
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : score >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function InterviewSetupPage() {
  const router                    = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked]        = useState(false);

  // Form state
  const [resumeText,  setResumeText]  = useState('');
  const [jobDesc,     setJobDesc]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // Session history
  const [sessions,     setSessions]    = useState<SessionSummary[]>([]);
  const [sessionsLoad, setSessionsLoad]= useState(false);

  // Upgrade modal
  const [showUpgrade, setShowUpgrade]  = useState(false);
  const [dailyLimit,  setDailyLimit]   = useState<{ limit: number; used: number } | null>(null);

  // ── Auth check ──────────────────────────────────────────────────────────
  useEffect(() => {
    checkAuth().then(() => setAuthChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAuthenticated]);

  // ── Fetch past sessions ─────────────────────────────────────────────────
  const fetchSessions = async () => {
    setSessionsLoad(true);
    try {
      const res = await api.get('/api/interview/sessions?limit=6');
      setSessions(res.data.sessions || []);
    } catch {
      // silently ignore — history is non-critical
    } finally {
      setSessionsLoad(false);
    }
  };

  // ── Start interview ─────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!resumeText.trim() || !resumeText.trim().length) {
      setError('Please paste your resume text.');
      return;
    }
    if (resumeText.trim().length < 100) {
      setError('Resume text is too short. Please paste your full resume.');
      return;
    }
    if (!jobDesc.trim() || jobDesc.trim().length < 50) {
      setError('Please paste the job description (at least 50 characters).');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/interview/start', {
        resume_text:     resumeText.trim(),
        job_description: jobDesc.trim(),
      });
      // Store session data so the room page can load questions without an extra API call
      sessionStorage.setItem(
        `interview_session_${res.data.session_id}`,
        JSON.stringify({ questions: res.data.questions, job_role: res.data.job_role })
      );
      router.push(`/tools/interview/${res.data.session_id}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;

      if (err?.response?.status === 403 && detail?.code === 'UPGRADE_REQUIRED') {
        setShowUpgrade(true);
      } else if (err?.response?.status === 429) {
        setDailyLimit({ limit: detail?.limit ?? 3, used: detail?.used ?? 3 });
        setError(`You've used all ${detail?.limit ?? 3} interview sessions for today. Come back tomorrow!`);
      } else {
        setError(detail?.message || detail || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const isPaidUser = user?.subscription_type === 'starter' || user?.subscription_type === 'pro';

  return (
    <div className="bg-[#050816] min-h-screen">

      {/* ── Upgrade modal ── */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(5,8,22,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-indigo-500/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 text-3xl">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Access</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI Mock Interview is available on <span className="text-indigo-300 font-semibold">Starter</span> and <span className="text-purple-300 font-semibold">Pro</span> plans. Unlock personalised AI interview coaching today.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowUpgrade(false)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300 transition text-sm">
                Maybe Later
              </button>
              <Link href="/pricing" className="flex-1 btn-primary py-3 rounded-xl text-sm text-center font-semibold">
                View Plans →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16 pb-12">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-8%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full text-sm font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
                AI-Powered • Starter & Pro
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                Mock Interview<br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Powered by AI
                </span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
                Paste your resume + job description. Get 10 personalised interview questions, answer them, and receive instant AI scoring with detailed feedback.
              </p>

              {/* Feature chips */}
              <div className="flex flex-wrap gap-3 mb-8">
                {['10 AI Questions', 'Instant Scoring', 'Readiness Report', 'Free for Paid Plans'].map((chip) => (
                  <span key={chip} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                    ✓ {chip}
                  </span>
                ))}
              </div>

              {/* Daily usage pill */}
              {isPaidUser && sessions.length > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  {sessions.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length} of {user?.subscription_type === 'pro' ? 10 : 3} sessions used today
                </div>
              )}
            </div>

            {/* Right: 3D floating question cards */}
            <div className="relative h-72 lg:h-80 hidden md:block">
              {/* Central card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="glass-card rounded-2xl p-6 w-72 shadow-2xl"
                  style={{
                    border: '1px solid rgba(99,102,241,0.35)',
                    transform: 'perspective(800px) rotateY(-8deg) rotateX(4deg)',
                    boxShadow: '0 25px 60px rgba(99,102,241,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">Q5</div>
                    <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">Behavioral</span>
                    <span className="text-xs text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 ml-auto">Medium</span>
                  </div>
                  <p className="text-white text-sm font-medium leading-relaxed mb-4">
                    Describe a time when you had to learn a new technology quickly to complete a project. How did you approach it?
                  </p>
                  <div className="h-8 rounded-lg bg-white/5 border border-white/10 flex items-center px-3">
                    <span className="text-gray-600 text-xs">Type your answer...</span>
                  </div>
                </div>
              </div>

              {/* Floating mini cards */}
              <FloatingCard
                text="Why do you want this role?"
                style={{ top: '5%', left: '0%', transform: 'perspective(600px) rotateY(12deg) rotateX(-5deg)', animation: 'float1 6s ease-in-out infinite', opacity: 0.75 }}
              />
              <FloatingCard
                text="Tell me about a challenging bug you solved."
                style={{ bottom: '8%', right: '0%', transform: 'perspective(600px) rotateY(-10deg) rotateX(6deg)', animation: 'float2 7s ease-in-out infinite', opacity: 0.7 }}
              />
              <FloatingCard
                text="How do you handle tight deadlines?"
                style={{ top: '55%', left: '2%', transform: 'perspective(600px) rotateY(8deg)', animation: 'float3 8s ease-in-out infinite', opacity: 0.6 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURE_CARDS.map((fc) => (
              <div key={fc.title} className="glass-card rounded-xl p-5 flex items-start gap-4">
                <div className="text-3xl">{fc.icon}</div>
                <div>
                  <p className="font-semibold text-white mb-1 text-sm">{fc.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{fc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="glass-card rounded-2xl p-8 border border-white/10"
            style={{ boxShadow: '0 0 60px rgba(99,102,241,0.08)' }}>

            <div className="flex items-center gap-3 mb-8">
              <span className="w-1 h-7 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 inline-block" />
              <h2 className="text-xl font-bold text-white">Start New Interview</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">

              {/* Resume */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Your Resume
                  <span className="text-red-400 ml-1">*</span>
                  <span className="text-gray-600 font-normal ml-2 text-xs">Paste as plain text</span>
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={"Paste your resume here...\n\nExample:\nJohn Doe | john@email.com\nSoftware Engineer with 3 years experience...\n\nSkills: Python, React, Node.js, AWS\n\nExperience:\nSoftware Engineer @ TCS (2021-2024)\n- Built REST APIs serving 1M+ daily requests..."}
                  rows={14}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 resize-none transition leading-relaxed font-mono"
                />
                <p className="text-xs text-gray-600 mt-1.5">{resumeText.length} characters{resumeText.length > 0 && resumeText.length < 100 ? ' — too short' : ''}</p>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Job Description
                  <span className="text-red-400 ml-1">*</span>
                  <span className="text-gray-600 font-normal ml-2 text-xs">From the job posting</span>
                </label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder={"Paste the job description here...\n\nExample:\nSoftware Engineer — Infosys\n\nResponsibilities:\n- Design and develop scalable backend services\n- Work with cross-functional teams...\n\nRequirements:\n- 2+ years experience in Java or Python\n- Strong understanding of OOP concepts..."}
                  rows={14}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 resize-none transition leading-relaxed"
                />
                <p className="text-xs text-gray-600 mt-1.5">{jobDesc.length} characters</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={handleStart}
                disabled={loading || !resumeText.trim() || !jobDesc.trim()}
                className="relative btn-primary px-10 py-4 text-base font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                    Generating questions…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Start Interview
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
              <p className="text-xs text-gray-600">
                Takes ~30 seconds to generate · Uses Claude AI · Answers scored instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Past sessions ── */}
      {(sessions.length > 0 || sessionsLoad) && (
        <section className="pb-20 border-t border-white/5 pt-14">
          <div className="container mx-auto px-4 max-w-6xl">

            <div className="flex items-center gap-3 mb-8">
              <span className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500 inline-block" />
              <h2 className="text-xl font-bold text-white">Past Sessions</h2>
              <span className="text-gray-600 text-sm ml-auto">{sessions.length} sessions</span>
            </div>

            {sessionsLoad ? (
              <div className="grid md:grid-cols-3 gap-5">
                {[1,2,3].map(i => (
                  <div key={i} className="glass-card rounded-xl p-5 animate-pulse h-36" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessions.map((s) => {
                  const cfg = READINESS_CONFIG[s.readiness_level || 'not_ready'];
                  const isComplete = s.status === 'completed';
                  return (
                    <Link
                      key={s.id}
                      href={isComplete ? `/tools/interview/${s.id}/report` : `/tools/interview/${s.id}`}
                      className="group glass-card rounded-xl p-5 block hover:border-indigo-500/30 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate group-hover:text-indigo-300 transition">
                            {s.job_role || 'Interview Session'}
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5">
                            {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        {isComplete && s.overall_score !== null && (
                          <div className="relative flex-shrink-0">
                            <ScoreRing score={s.overall_score} size={44} />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                              {Math.round(s.overall_score)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isComplete ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon} {s.readiness_label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 border border-amber-500/30 text-amber-300">
                            ⏸ {s.questions_answered}/10 answered
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-indigo-400 mt-3 group-hover:text-indigo-300 transition">
                        {isComplete ? 'View Report →' : 'Continue →'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Float animations */}
      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: perspective(600px) rotateY(12deg) rotateX(-5deg) translateY(0px); }
          50%       { transform: perspective(600px) rotateY(12deg) rotateX(-5deg) translateY(-12px); }
        }
        @keyframes float2 {
          0%, 100% { transform: perspective(600px) rotateY(-10deg) rotateX(6deg) translateY(0px); }
          50%       { transform: perspective(600px) rotateY(-10deg) rotateX(6deg) translateY(-10px); }
        }
        @keyframes float3 {
          0%, 100% { transform: perspective(600px) rotateY(8deg) translateY(0px); }
          50%       { transform: perspective(600px) rotateY(8deg) translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
