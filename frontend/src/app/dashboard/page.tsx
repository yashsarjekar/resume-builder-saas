'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Resume } from '@/types/resume';
import { formatDate, getSubscriptionColor, getATSScoreColor } from '@/lib/utils';
import UpgradeModal from '@/components/UpgradeModal';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [resumeStats, setResumeStats] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchResumes();
  }, [authChecked, isAuthenticated, router]);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/api/resume');
      if (Array.isArray(response.data)) {
        setResumes(response.data);
      } else if (response.data && Array.isArray(response.data.resumes)) {
        setResumes(response.data.resumes);
      } else {
        setResumes([]);
      }
    } catch (error: any) {
      setResumes([]);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/api/resume/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) { alert('Please upload a PDF or Word document'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Resume uploaded successfully! Redirecting to builder...');
      router.push(`/builder?id=${response.data.id}`);
    } catch (error: any) {
      if (error.response?.status === 429) {
        alert(error.response.data.detail || 'Resume limit reached for your plan');
      } else {
        alert('Failed to upload resume. Please try again.');
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await api.get('/api/payment/history');
      setPaymentHistory(response.data.payments || []);
    } catch { setPaymentHistory([]); }
  };

  const fetchResumeStats = async () => {
    try {
      const response = await api.get('/api/resume/stats/summary');
      setResumeStats(response.data);
    } catch { setResumeStats(null); }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getResumeLimit = () => {
    const isIntl = user.region === 'INTL';
    const dur = user.billing_duration || 1;
    if (user.subscription_type === 'pro') return 'Unlimited';
    const base = user.subscription_type === 'starter' ? (isIntl ? 15 : 5) : (isIntl ? 5 : 1);
    return base * dur;
  };

  const getATSLimit = () => {
    const isIntl = user.region === 'INTL';
    const dur = user.billing_duration || 1;
    if (user.subscription_type === 'pro') return 'Unlimited';
    const base = user.subscription_type === 'starter' ? (isIntl ? 15 : 10) : (isIntl ? 5 : 2);
    return base * dur;
  };

  const resumeLimit  = getResumeLimit();
  const atsLimit     = getATSLimit();
  const resumePct    = typeof resumeLimit  === 'number' ? Math.min((user.resume_count      / resumeLimit)  * 100, 100) : 100;
  const atsPct       = typeof atsLimit     === 'number' ? Math.min((user.ats_analysis_count / atsLimit)    * 100, 100) : 100;

  const planGradient =
    user.subscription_type === 'pro'     ? 'from-amber-500 to-orange-500' :
    user.subscription_type === 'starter' ? 'from-indigo-500 to-purple-500' :
                                           'from-gray-500 to-gray-600';

  const AI_TOOLS = [
    { href: '/tools/interview',    emoji: '🎤', label: 'AI Mock Interview',     desc: 'Practice with AI-scored questions', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', badge: 'Starter & Pro' },
    { href: '/tools/keywords',     emoji: '🔑', label: 'Keyword Extractor',      desc: 'Pull exact skills from any JD',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)'  },
    { href: '/tools/cover-letter', emoji: '📝', label: 'Cover Letter Generator', desc: 'Tailored letters in 30 seconds',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    { href: '/tools/linkedin',     emoji: '💼', label: 'LinkedIn Optimizer',     desc: 'Attract 3× more recruiter views',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <style>{STYLES}</style>

      {user.subscription_type === 'free' && (
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} region={user.region} />
      )}

      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #0891b2, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-white/40 text-sm mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-black tracking-tight">
              {user.name?.split(' ')[0] ?? 'Dashboard'}
              <span className="text-white/30">'s Workspace</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${planGradient} text-white shadow-lg`}>
              {user.subscription_type}
            </span>
            {user.subscription_type === 'free' && (
              <Link href="/pricing"
                className="px-4 py-1.5 rounded-full text-xs font-semibold border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition"
              >
                Upgrade ↗
              </Link>
            )}
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Subscription card */}
          <div className="stat-card glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(168,85,247,0.15)' }}>🏆</div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Plan</p>
                <p className="font-bold capitalize text-white">{user.subscription_type}</p>
              </div>
            </div>
            {user.subscription_expiry && (
              <p className="text-xs text-white/30">Expires {formatDate(user.subscription_expiry)}</p>
            )}
            {user.subscription_type === 'free' && (
              <Link href="/pricing"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
              >
                Upgrade for more features →
              </Link>
            )}
          </div>

          {/* Resumes card */}
          <div className="stat-card glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(99,102,241,0.15)' }}>📄</div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Resumes</p>
                <p className="font-bold text-white">{user.resume_count} <span className="text-white/40 font-normal text-sm">/ {resumeLimit}</span></p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${resumePct}%` }} />
            </div>
            <p className="text-xs text-white/30 mt-1.5">{Math.round(resumePct)}% used</p>
          </div>

          {/* ATS analyses card */}
          <div className="stat-card glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(34,197,94,0.15)' }}>🎯</div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">ATS Analyses</p>
                <p className="font-bold text-white">{user.ats_analysis_count} <span className="text-white/40 font-normal text-sm">/ {atsLimit}</span></p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                style={{ width: `${atsPct}%` }} />
            </div>
            <p className="text-xs text-white/30 mt-1.5">{Math.round(atsPct)}% used</p>
          </div>
        </div>

        {/* ── AI Tools ────────────────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lg">⚡</span>
            <h2 className="text-lg font-bold text-white">AI Tools</h2>
            <span className="ml-auto text-xs text-white/30">Click to open</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AI_TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="tool-card group relative rounded-xl p-4 transition-all duration-300 overflow-hidden"
                style={{ background: t.bg, border: `1px solid ${t.border}` }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${t.color}20, transparent 60%)` }} />
                <div className="relative">
                  <div className="text-2xl mb-3">{t.emoji}</div>
                  <h3 className="font-semibold text-white text-sm mb-1">{t.label}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{t.desc}</p>
                  {t.badge && (
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ color: t.color, background: `${t.color}20`, border: `1px solid ${t.color}30` }}>
                      {t.badge}
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 text-white/20 group-hover:text-white/60 transition-colors text-xs">→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Resume Analytics (collapsible) ──────────────────────────────── */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <button
            onClick={() => { setShowStats(!showStats); if (!showStats && !resumeStats) fetchResumeStats(); }}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h2 className="text-lg font-bold text-white">Resume Analytics</h2>
            </div>
            <span className={`text-white/40 text-sm transition-transform duration-300 ${showStats ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showStats && (
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Resumes',  value: resumeStats?.total_resumes   ?? 0,  color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
                { label: 'ATS Optimized',  value: resumeStats?.optimized_count ?? 0,  color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
                { label: 'Avg ATS Score',  value: resumeStats?.average_ats_score ? `${Math.round(resumeStats.average_ats_score)}%` : 'N/A', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
                { label: 'Templates Used', value: resumeStats?.templates_used ? Object.keys(resumeStats.templates_used).length : 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-4 text-center"
                  style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
                  <p className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              ))}
              {resumeStats?.most_used_template && (
                <div className="col-span-full rounded-xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-white/40 text-sm">Most used template:</span>
                  <span className="font-semibold text-white capitalize">{resumeStats.most_used_template}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Subscription & Payments ──────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <button
            onClick={() => { setShowPaymentHistory(!showPaymentHistory); if (!showPaymentHistory && paymentHistory.length === 0) fetchPaymentHistory(); }}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <h2 className="text-lg font-bold text-white">Subscription & Payments</h2>
            </div>
            <span className={`text-white/40 text-sm transition-transform duration-300 ${showPaymentHistory ? 'rotate-180' : ''}`}>▼</span>
          </button>

          <div className="mt-5 grid md:grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 mb-1">Current Plan</p>
              <p className="text-xl font-bold text-white capitalize">{user.subscription_type}</p>
              {user.subscription_expiry && (
                <p className="text-xs text-white/30 mt-1">Expires {formatDate(user.subscription_expiry)}</p>
              )}
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 mb-1">
                Usage this {user.billing_duration === 1 ? 'Month' : user.billing_duration === 3 ? 'Quarter' : user.billing_duration === 6 ? 'Half-Year' : 'Year'}
              </p>
              <p className="text-sm text-white/70">Resumes: <span className="text-white font-semibold">{user.resume_count} / {resumeLimit}</span></p>
              <p className="text-sm text-white/70">ATS Analyses: <span className="text-white font-semibold">{user.ats_analysis_count} / {atsLimit}</span></p>
            </div>
          </div>

          {showPaymentHistory && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-white/60 mb-3">Payment History</p>
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">No payment history found</p>
              ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <table className="min-w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Date', 'Plan', 'Amount', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment: any) => (
                        <tr key={payment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="px-4 py-3 text-sm text-white/70">{formatDate(payment.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-white/70 capitalize">{payment.plan}</td>
                          <td className="px-4 py-3 text-sm text-white/70">₹{(Number(payment.amount) / 100).toFixed(0)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}>{payment.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── My Resumes ──────────────────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">📂</span>
              <h2 className="text-lg font-bold text-white">My Resumes</h2>
              <span className="ml-2 text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{resumes.length}</span>
            </div>
            <div className="flex gap-2">
              <label className="cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold text-emerald-300 transition-all hover:scale-105"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                {uploading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
                    Uploading…
                  </span>
                ) : '📤 Upload'}
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>
              <Link href="/builder"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
              >
                + New Resume
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/40 text-sm">Loading resumes…</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>📄</div>
              <h3 className="text-white font-semibold mb-1">No resumes yet</h3>
              <p className="text-white/40 text-sm mb-6">Create your first ATS-optimized resume in minutes.</p>
              <Link href="/builder"
                className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                Create Resume →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => {
                const score = resume.ats_score;
                const scoreColor = score ? (score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444') : null;
                return (
                  <div key={resume.id}
                    className="resume-card group rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {/* Top: title + ATS score */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm leading-snug truncate">{resume.title}</h3>
                      {score && (
                        <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ color: scoreColor!, background: `${scoreColor}18`, border: `1px solid ${scoreColor}30` }}>
                          {score}%
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                      {resume.job_description?.substring(0, 100) || 'No description'}…
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-white/30 flex-wrap">
                      <span>{resume.updated_at ? formatDate(resume.updated_at) : 'Recently'}</span>
                      <span>·</span>
                      <span className="capitalize">{resume.template_name || 'modern'}</span>
                    </div>

                    {/* ATS score bar */}
                    {score && (
                      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${score}%`, background: scoreColor! }} />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Link href={`/builder?id=${resume.id}`}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold text-center text-indigo-300 transition-all hover:bg-indigo-500/20"
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(resume.id)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
  .stat-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .stat-card:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
  .tool-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 32px rgba(0,0,0,0.35);
  }
  .resume-card:hover {
    box-shadow: 0 0 0 1px rgba(99,102,241,0.3), 0 20px 40px rgba(0,0,0,0.4);
    border-color: rgba(99,102,241,0.3) !important;
  }
`;
