import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Free AI Resume Builder | Create ATS-Optimized Resumes Online';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #050816 0%, #0f0c29 40%, #1a0533 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Purple glow top-left */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
          }}
        />
        {/* Cyan glow bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
          }}
        />
        {/* Purple glow center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            marginBottom: '28px',
            boxShadow: '0 0 40px rgba(99,102,241,0.6)',
          }}
        >
          <span style={{ color: 'white', fontSize: '36px', fontWeight: 900 }}>R</span>
        </div>

        {/* Brand name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '36px', fontWeight: 800, color: 'white' }}>
            Resume Builder
          </span>
          <span style={{ fontSize: '36px', fontWeight: 800, color: '#818cf8' }}>AI</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          Free AI Resume Builder
        </div>

        {/* Sub-headline */}
        <div
          style={{
            fontSize: '26px',
            color: 'rgba(148,163,184,0.9)',
            textAlign: 'center',
            maxWidth: '760px',
            marginBottom: '36px',
            lineHeight: 1.4,
          }}
        >
          Create ATS-Optimized Resumes · AI Mock Interviews · Portfolio Pages
        </div>

        {/* Pill badges */}
        <div style={{ display: 'flex', gap: '14px' }}>
          {['12,000+ Users', 'ATS-Guaranteed', 'Free to Start'].map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 22px',
                borderRadius: '999px',
                border: '1px solid rgba(99,102,241,0.5)',
                background: 'rgba(99,102,241,0.12)',
                color: '#a5b4fc',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Domain watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            right: '36px',
            fontSize: '16px',
            color: 'rgba(255,255,255,0.25)',
            fontWeight: 500,
          }}
        >
          resumebuilder.pulsestack.in
        </div>
      </div>
    ),
    { ...size }
  );
}
