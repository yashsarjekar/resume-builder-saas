'use client';
import { useEffect, useRef } from 'react';

export default function ResumeMockupClient() {
  const cardRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      cardRef.current.style.animationPlayState = 'paused';
      cardRef.current.style.transform =
        `rotateY(${-12 + x}deg) rotateX(${4 - y}deg) translateZ(20px)`;
    };
    const handleMouseLeave = () => {
      if (!cardRef.current) return;
      cardRef.current.style.animationPlayState = 'running';
      cardRef.current.style.transform = '';
    };
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow orb behind card */}
      <div className="pointer-events-none" style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        zIndex: -1,
        right: '5%',
        top: '50%',
        transform: 'translateY(-50%)',
      }} />

      {/* Perspective wrapper */}
      <div style={{ perspective: '800px', perspectiveOrigin: 'center center' }}>
        {/* Card wrapper — 3D float + mousemove target */}
        <div
          ref={cardRef}
          className="hero-card relative w-64 lg:w-72"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 0 1px rgba(139,92,246,0.3), 0 30px 80px rgba(0,0,0,0.6), 0 0 120px rgba(99,102,241,0.15)',
          }}
        >
          {/* ATS badge top-right */}
          <div className="badge-float absolute -top-4 -right-4 z-20 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/40">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            ATS Score: 94%
          </div>

          {/* AI badge bottom-left */}
          <div className="badge-float absolute -bottom-4 -left-4 z-20 flex items-center gap-2 bg-[#0d1224] border border-indigo-500/40 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg" style={{ animationDelay: '0.8s' }}>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            AI Optimized
          </div>

          {/* Main resume card */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
            <div className="p-5">
              {/* Person row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-24 bg-gray-800 rounded-sm" />
                  <div className="h-1.5 w-32 bg-gray-300 rounded-sm" />
                </div>
              </div>
              {/* Contact chips */}
              <div className="flex gap-1.5 mb-4">
                {[14, 18, 12].map((w, i) => (
                  <div key={i} className="h-1.5 bg-gray-200 rounded-sm" style={{ width: `${w * 4}px` }} />
                ))}
              </div>
              {/* Experience section */}
              <div className="mb-3">
                <div className="h-1.5 w-20 bg-indigo-600 rounded-sm mb-2" />
                <div className="pl-2 border-l-2 border-indigo-100 space-y-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded-sm" />
                  <div className="h-1.5 w-4/5 bg-gray-200 rounded-sm" />
                  <div className="h-1.5 w-3/4 bg-gray-100 rounded-sm" />
                </div>
              </div>
              {/* Skills */}
              <div className="mb-3">
                <div className="h-1.5 w-14 bg-indigo-600 rounded-sm mb-2" />
                <div className="flex flex-wrap gap-1">
                  {['React', 'Node.js', 'Python', 'AWS'].map((s) => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">{s}</span>
                  ))}
                </div>
              </div>
              {/* Education */}
              <div>
                <div className="h-1.5 w-18 bg-indigo-600 rounded-sm mb-2" />
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded-sm" />
                  <div className="h-1.5 w-2/3 bg-gray-100 rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Reflection shadow */}
          <div className="absolute -bottom-6 left-4 right-4 h-6 bg-black/30 blur-xl rounded-full" />
        </div>
      </div>
    </div>
  );
}
