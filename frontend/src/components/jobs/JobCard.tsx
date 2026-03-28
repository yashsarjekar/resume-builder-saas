'use client';

import { useRef, useState } from 'react';

export interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  category: string;
  tags: string[];
  job_type: string;
  location: string;
  salary: string;
  url: string;
  posted_at: string;
  description?: string;
}

export interface AtsResult {
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
}

interface JobCardProps {
  job: Job;
  index: number;
  isLocked: boolean;
  onLockedClick: () => void;
  onViewDetails: (job: Job) => void;
  atsResult?: AtsResult | null;
  onAtsMatch?: (job: Job) => void;
  atsLoading?: boolean;
  canAtsMatch?: boolean; // true when logged in + has resume
}

const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
];

const GRADIENT_TOPS = [
  'from-blue-500 via-violet-500 to-purple-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-orange-500 via-pink-500 to-rose-500',
  'from-violet-500 via-purple-500 to-indigo-500',
  'from-cyan-500 via-blue-500 to-indigo-500',
  'from-pink-500 via-rose-500 to-red-500',
];

const LOGO_BG_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-rose-500',
];

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const hrs = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function scoreColor(score: number) {
  if (score >= 75) return { bar: 'from-emerald-500 to-teal-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 50) return { bar: 'from-amber-400 to-orange-400', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
  return { bar: 'from-red-400 to-rose-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200' };
}

export default function JobCard({ job, index, isLocked, onLockedClick, onViewDetails, atsResult, onAtsMatch, atsLoading, canAtsMatch }: JobCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });
  const [hovered, setHovered] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({ x: ((y - cy) / cy) * 7, y: ((cx - x) / cx) * 7 });
    setShine({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.1 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShine((s) => ({ ...s, opacity: 0 }));
    setHovered(false);
  };

  const isNew = new Date(job.posted_at) > new Date(Date.now() - 48 * 3600000);
  const gradientClass = GRADIENT_TOPS[index % GRADIENT_TOPS.length];
  const colorIdx = (job.company?.charCodeAt(0) || 0) % LOGO_BG_COLORS.length;
  const logoBg = LOGO_BG_COLORS[colorIdx];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? 'scale3d(1.02,1.02,1.02)' : 'scale3d(1,1,1)'}`,
        transition: hovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className="relative h-full cursor-pointer"
      onClick={() => isLocked ? onLockedClick() : onViewDetails(job)}
    >
      {/* Hover glow */}
      <div
        className="absolute -inset-0.5 rounded-2xl blur-sm transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
          opacity: hovered ? 0.25 : 0,
        }}
      />

      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden h-full flex flex-col">
        {/* Shine */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl z-10"
          style={{
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,${shine.opacity * 4}), transparent 55%)`,
          }}
        />

        {/* Gradient top bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${gradientClass} flex-shrink-0`} />

        <div className="p-5 flex flex-col flex-1">
          {/* Header: logo + title */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Company logo with colored fallback */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm ${!job.logo || logoError ? logoBg : 'bg-gray-50 border border-gray-100'}`}>
                {job.logo && !logoError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-10 h-10 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-lg font-black text-white">
                    {job.company?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">{job.company}</p>
                <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{job.title}</h3>
              </div>
            </div>
            {isNew && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                NEW
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location || 'Worldwide'}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeAgo(job.posted_at)}
            </span>
            {job.job_type && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium border border-indigo-100">
                {job.job_type}
              </span>
            )}
          </div>

          {/* Salary */}
          {job.salary && (
            <div className="mb-3 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-semibold text-emerald-700">{job.salary}</p>
              </div>
            </div>
          )}

          {/* Tags — items-start prevents stretch-to-circle bug in flex-col cards */}
          <div className="flex flex-wrap gap-1.5 mb-4 min-h-[40px] items-start content-start">
            {job.tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                style={{ height: '22px', lineHeight: '22px' }}
                className={`inline-flex items-center text-xs px-2.5 rounded-full font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span
                style={{ height: '22px', lineHeight: '22px' }}
                className="inline-flex items-center text-xs px-2 rounded-full font-medium bg-gray-100 text-gray-500"
              >
                +{job.tags.length - 4}
              </span>
            )}
          </div>

          {/* CTA */}
          {isLocked ? (
            <button
              onClick={(e) => { e.stopPropagation(); onLockedClick(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Upgrade to Unlock
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onViewDetails(job); }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r ${gradientClass} text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-md`}
                style={{ boxShadow: hovered ? '0 8px 25px -5px rgba(99,102,241,0.35)' : '' }}
              >
                View & Apply
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              {/* ATS Match button / score badge */}
              {canAtsMatch && (
                atsResult ? (
                  // Score badge — clicking opens modal with details
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(job); }}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${scoreColor(atsResult.score).bg} ${scoreColor(atsResult.score).text}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {atsResult.score}% ATS Match — View Details
                  </button>
                ) : atsLoading ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-400 text-sm font-medium"
                  >
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAtsMatch?.(job); }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    ATS Match
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
