'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import JobCard, { Job } from '@/components/jobs/JobCard';
import JobModal from '@/components/jobs/JobModal';
import UpgradeModal from '@/components/UpgradeModal';
import Link from 'next/link';

const CATEGORIES = [
  { label: 'All Jobs', value: '' },
  { label: 'Software Dev', value: 'software-dev' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Customer Service', value: 'customer-service' },
  { label: 'Data Science', value: 'data' },
  { label: 'DevOps', value: 'devops-sysadmin' },
  { label: 'Product', value: 'product' },
  { label: 'Sales', value: 'sales' },
  { label: 'Finance', value: 'finance-legal' },
  { label: 'HR', value: 'human-resources' },
];

const UNLOCK_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  pro: Infinity,
};

const JOBS_PER_PAGE = 21;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-gradient-to-r from-gray-200 to-gray-300" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-40" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-20" />
          <div className="h-5 bg-gray-200 rounded-full w-14" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobLocked, setSelectedJobLocked] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const plan = (user?.subscription_type?.toLowerCase() || 'free') as string;
  const unlockLimit = UNLOCK_LIMITS[plan] ?? 5;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

  const fetchJobs = useCallback(
    async (reset: boolean, currentOffset: number) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams();
        params.set('limit', String(JOBS_PER_PAGE));
        params.set('offset', String(currentOffset));
        if (search) params.set('search', search);
        if (category) params.set('category', category);

        const res = await fetch(`${apiBase}/api/jobs?${params.toString()}`);
        const data = await res.json();

        if (reset) {
          setJobs(data.jobs || []);
          setOffset(JOBS_PER_PAGE);
        } else {
          setJobs((prev) => [...prev, ...(data.jobs || [])]);
          setOffset(currentOffset + JOBS_PER_PAGE);
        }
        setTotal(data.total || 0);
      } catch (e) {
        console.error('Jobs fetch error:', e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, category, apiBase]
  );

  useEffect(() => {
    fetchJobs(true, 0);
  }, [search, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleLoadMore = () => {
    fetchJobs(false, offset);
  };

  const hasMore = jobs.length < total;

  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .blob { animation: blob 8s infinite ease-in-out; }
        .blob-delay-2 { animation-delay: 2s; }
        .blob-delay-4 { animation-delay: 4s; }
        .float { animation: float 4s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #a5b4fc, #f0abfc, #67e8f9, #a5b4fc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .category-scroll::-webkit-scrollbar { display: none; }
        .category-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gray-950 pt-16 pb-24">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob blob-delay-0 absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[80px]" />
          <div className="blob blob-delay-2 absolute top-[-50px] right-[-100px] w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[80px]" />
          <div className="blob blob-delay-4 absolute bottom-[-100px] left-[30%] w-[450px] h-[450px] rounded-full bg-violet-600/15 blur-[80px]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {total > 0 ? `${total.toLocaleString()} remote jobs live right now` : 'Live remote jobs'}
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight tracking-tight">
            Find Your{' '}
            <span className="shimmer-text">Dream Remote</span>
            <br />Job Today
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
            Curated remote opportunities from top companies worldwide. Build your resume, then land the job.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl shadow-black/20">
              <div className="pl-4 pr-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search jobs, skills, companies..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none px-3 py-2 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-500/25"
              >
                Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-10">
            {[
              { label: 'Remote Jobs', value: total > 0 ? `${total.toLocaleString()}+` : '...' },
              { label: 'Categories', value: '10+' },
              { label: 'New Today', value: '100+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════ */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">

          {/* Upgrade banner for free users */}
          {(!isAuthenticated || plan === 'free') && (
            <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-px">
              <div className="bg-white rounded-[15px] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">You&apos;re viewing {unlockLimit} of {total.toLocaleString()} jobs</p>
                    <p className="text-xs text-gray-500">Upgrade to Starter to unlock 50 jobs, Pro for unlimited access</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex-shrink-0 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-indigo-200"
                >
                  Unlock All Jobs →
                </button>
              </div>
            </div>
          )}

          {/* Category filters */}
          <div className="category-scroll flex gap-2 overflow-x-auto pb-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Result count */}
          {!loading && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{jobs.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> jobs
                {search && (
                  <span> for &quot;<span className="text-indigo-600">{search}</span>&quot;</span>
                )}
              </p>
              {search && (
                <button
                  onClick={() => { setSearch(''); setSearchInput(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Job grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 text-sm">Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, index) => {
                const isLocked = index >= unlockLimit;
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    isLocked={isLocked}
                    onLockedClick={() => setShowUpgrade(true)}
                    onViewDetails={(j) => { setSelectedJob(j); setSelectedJobLocked(isLocked); }}
                  />
                );
              })}
            </div>
          )}

          {/* Load more */}
          {!loading && hasMore && (
            <div className="text-center mt-12">
              {plan === 'free' && jobs.length >= unlockLimit ? (
                <div className="space-y-3">
                  <p className="text-gray-500 text-sm">
                    {total - unlockLimit} more jobs available with an upgrade
                  </p>
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200"
                  >
                    Unlock All {total.toLocaleString()} Jobs
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Jobs
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Bottom CTA — build resume */}
          <div className="mt-20 relative overflow-hidden rounded-3xl bg-gray-900 p-px">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-60 rounded-3xl" />
            <div className="relative bg-gray-950 rounded-[23px] px-8 py-12 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                  Ready to apply? Make your resume <span className="shimmer-text">ATS-ready</span> first.
                </h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                  Most resumes get rejected before a human sees them. Our AI optimizes your resume for each job description in seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/builder"
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
                  >
                    Build My Resume Free
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-8 py-3 border border-white/20 text-gray-300 font-semibold rounded-xl hover:bg-white/5 transition-colors"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job detail modal */}
      <JobModal
        job={selectedJob}
        isLocked={selectedJobLocked}
        onClose={() => setSelectedJob(null)}
        onUpgrade={() => { setSelectedJob(null); setShowUpgrade(true); }}
      />

      {/* Upgrade modal */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        region={user?.region || 'IN'}
      />
    </>
  );
}
