'use client';

const TESTIMONIALS = [
  {
    name: 'Priya Mehta',
    role: 'Software Engineer',
    company: 'Infosys → Flipkart',
    avatar: 'PM',
    color: '#6366f1',
    text: 'Built my ATS resume in 8 minutes. Got a call from Flipkart the next week. The AI actually understands what recruiters look for.',
    stars: 5,
  },
  {
    name: 'Rahul Sharma',
    role: 'Product Manager',
    company: 'Freshworks',
    avatar: 'RS',
    color: '#8b5cf6',
    text: 'The mock interview feature is insane. It reads questions aloud, I answer, it gives real feedback. Felt like a real interview. Landed the PM role.',
    stars: 5,
  },
  {
    name: 'Anika Patel',
    role: 'Data Analyst',
    company: 'Deloitte',
    avatar: 'AP',
    color: '#06b6d4',
    text: 'My old resume had a 12% ATS pass rate. After one edit session here it hit 94%. Three interviews in two weeks.',
    stars: 5,
  },
  {
    name: 'James Okafor',
    role: 'Backend Developer',
    company: 'TCS → Remote US startup',
    avatar: 'JO',
    color: '#10b981',
    text: 'The portfolio page feature is what closed the deal. Sent a 3D shareable link — the interviewer said it was the most impressive application they received.',
    stars: 5,
  },
  {
    name: 'Sneha Rao',
    role: 'UX Designer',
    company: "Byju's → Swiggy",
    avatar: 'SR',
    color: '#f59e0b',
    text: 'Generated 6 tailored resumes for different roles in one evening. Each one felt custom-written. Worth every rupee.',
    stars: 5,
  },
  {
    name: 'Arjun Nair',
    role: 'Full-Stack Engineer',
    company: 'Google',
    avatar: 'AN',
    color: '#ef4444',
    text: "Cover letter AI is genuinely good. It matched my tone, referenced the job description, and didn't sound robotic. Hiring manager mentioned it specifically.",
    stars: 5,
  },
];

function StarRow() {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function TestimonialsSection() {
  const row1 = [...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(0, 3)];
  const row2 = [...TESTIMONIALS.slice(3), ...TESTIMONIALS.slice(3)];

  return (
    <section
      style={{
        padding: '96px 0',
        background: 'linear-gradient(180deg, #030712 0%, #05080f 50%, #030712 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '20%', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div className="text-center scroll-reveal" style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', color: '#06b6d4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
            Real results from real people
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '16px' }}>
            Job Seekers Love{' '}
            <span className="shimmer-text">Resume Builder AI</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
            Thousands of professionals landed interviews and offers using our AI-powered tools.
          </p>
        </div>

        <style>{`
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-track-left { animation: marquee-left 32s linear infinite; }
          .marquee-track-right { animation: marquee-right 36s linear infinite; }
          .marquee-track-left:hover, .marquee-track-right:hover { animation-play-state: paused; }
          .t-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 28px 28px 24px;
            width: 320px;
            flex-shrink: 0;
            cursor: default;
            transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
            backdrop-filter: blur(12px);
            position: relative;
            overflow: hidden;
          }
          .t-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(99,102,241,0.07) 0%, transparent 60%);
            opacity: 0;
            transition: opacity 0.35s ease;
          }
          .t-card:hover {
            transform: translateY(-6px) scale(1.02);
            border-color: rgba(99,102,241,0.35);
            box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(99,102,241,0.12);
          }
          .t-card:hover::before { opacity: 1; }
        `}</style>

        {/* Row 1 — scrolls left */}
        <div style={{ overflow: 'hidden', marginBottom: '20px', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
          <div className="marquee-track-left" style={{ display: 'flex', gap: '20px', width: 'max-content' }}>
            {row1.map((t, i) => (
              <div key={i} className="t-card">
                <div style={{ fontSize: '40px', lineHeight: 1, color: t.color, opacity: 0.4, fontFamily: 'Georgia, serif', marginBottom: '4px' }}>&ldquo;</div>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '14px', lineHeight: '1.7', marginBottom: '20px', minHeight: '80px' }}>
                  {t.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}cc, ${t.color}55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', border: `2px solid ${t.color}66`, flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.role} · {t.company}</div>
                  </div>
                  <StarRow />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
          <div className="marquee-track-right" style={{ display: 'flex', gap: '20px', width: 'max-content' }}>
            {row2.map((t, i) => (
              <div key={i} className="t-card">
                <div style={{ fontSize: '40px', lineHeight: 1, color: t.color, opacity: 0.4, fontFamily: 'Georgia, serif', marginBottom: '4px' }}>&ldquo;</div>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '14px', lineHeight: '1.7', marginBottom: '20px', minHeight: '80px' }}>
                  {t.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}cc, ${t.color}55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', border: `2px solid ${t.color}66`, flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.role} · {t.company}</div>
                  </div>
                  <StarRow />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof bar */}
        <div className="scroll-reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginTop: '56px' }}>
          {[
            { value: '12,000+', label: 'Resumes built' },
            { value: '4.9★', label: 'Average rating' },
            { value: '3×', label: 'More interview calls' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
