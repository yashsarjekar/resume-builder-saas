'use client';

import { useEffect } from 'react';
import { Job } from './JobCard';

interface JobModalProps {
  job: Job | null;
  isLocked: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
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

const LOGO_BG_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-rose-500',
];

export default function JobModal({ job, isLocked, onClose, onUpgrade }: JobModalProps) {
  useEffect(() => {
    if (!job) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [job, onClose]);

  if (!job) return null;

  const colorIdx = job.company?.charCodeAt(0) % LOGO_BG_COLORS.length || 0;
  const bgColor = LOGO_BG_COLORS[colorIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden`}>
              {job.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="text-2xl font-black text-white">${job.company?.[0] || '?'}</span>`;
                  }}
                />
              ) : (
                <span className="text-2xl font-black text-white">{job.company?.[0] || '?'}</span>
              )}
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">{job.company}</p>
              <h2 className="text-white text-xl font-black leading-tight">{job.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-white/70 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location || 'Worldwide'}
                </span>
                <span className="text-xs text-white/70 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {timeAgo(job.posted_at)}
                </span>
                {job.job_type && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{job.job_type}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Salary */}
          {job.salary && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-emerald-700">{job.salary}</span>
            </div>
          )}

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Skills & Tags</p>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium leading-5 ${TAG_COLORS[i % TAG_COLORS.length]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {(job as any).description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Job Description</p>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto pr-1">
                {(job as any).description}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="flex-shrink-0 p-5 border-t border-gray-100 bg-gray-50">
          {isLocked ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-500">Upgrade your plan to apply to this job</p>
              <button
                onClick={onUpgrade}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200"
              >
                Upgrade to Apply →
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm"
              >
                Close
              </button>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-indigo-200 text-sm"
              >
                Apply on Company Site
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
