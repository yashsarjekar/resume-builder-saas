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
}

interface JobCardProps {
  job: Job;
  index: number;
  isLocked: boolean;
  onLockedClick: () => void;
}

const TAG_COLORS = [
  'bg-blue-100 text-blue-700 border border-blue-200',
  'bg-violet-100 text-violet-700 border border-violet-200',
  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'bg-orange-100 text-orange-700 border border-orange-200',
  'bg-pink-100 text-pink-700 border border-pink-200',
  'bg-cyan-100 text-cyan-700 border border-cyan-200',
];

const GRADIENT_TOPS = [
  'from-blue-500 via-violet-500 to-purple-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-orange-500 via-pink-500 to-rose-500',
  'from-violet-500 via-purple-500 to-indigo-500',
  'from-cyan-500 via-blue-500 to-indigo-500',
  'from-pink-500 via-rose-500 to-red-500',
];

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const hrs = Math.floor((now.getTime() - date.getTime()) / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function JobCard({ job, index, isLocked, onLockedClick }: JobCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({
      x: ((y - cy) / cy) * 8,
      y: ((cx - x) / cx) * 8,
    });
    setShine({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShine((s) => ({ ...s, opacity: 0 }));
    setHovered(false);
  };

  const isNew = new Date(job.posted_at) > new Date(Date.now() - 48 * 3600000);
  const gradientClass = GRADIENT_TOPS[index % GRADIENT_TOPS.length];

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
      className="relative h-full"
    >
      {/* Glow shadow on hover */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
          opacity: hovered ? 0.3 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden h-full flex flex-col">
        {/* Shine overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl z-10"
          style={{
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,${shine.opacity * 4}), transparent 55%)`,
            transition: 'opacity 0.2s',
          }}
        />

        {/* Gradient top bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${gradientClass} flex-shrink-0`} />

        <div className="p-5 flex flex-col flex-1">
          {/* Company + title */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {job.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-400">
                    {job.company?.[0] || '?'}
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

          {/* Meta row */}
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

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
            {job.tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                +{job.tags.length - 4}
              </span>
            )}
          </div>

          {/* CTA button */}
          {isLocked ? (
            <button
              onClick={onLockedClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Upgrade to Unlock
            </button>
          ) : (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r ${gradientClass} text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg`}
              style={{ boxShadow: hovered ? '0 8px 25px -5px rgba(99,102,241,0.4)' : '' }}
            >
              Apply Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
