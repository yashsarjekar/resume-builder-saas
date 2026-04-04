'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// ── Theme config ──────────────────────────────────────────────────────────────

const THEME_COLORS: Record<string, { primary: string; glow: string; accent: string }> = {
  indigo:  { primary: '#6366f1', glow: 'rgba(99,102,241,0.35)',  accent: '#818cf8' },
  emerald: { primary: '#10b981', glow: 'rgba(16,185,129,0.35)',  accent: '#34d399' },
  amber:   { primary: '#f59e0b', glow: 'rgba(245,158,11,0.35)',  accent: '#fbbf24' },
  rose:    { primary: '#f43f5e', glow: 'rgba(244,63,94,0.35)',   accent: '#fb7185' },
};

// ── 3D Tilt hook ──────────────────────────────────────────────────────────────

function useTilt(ref: React.RefObject<HTMLDivElement>, strength = 12) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * strength;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * strength;
      el.style.transform = `perspective(800px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.02)`;
    };
    const onLeave = () => { el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [ref, strength]);
}

// ── Scroll-reveal hook ────────────────────────────────────────────────────────

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add('revealed'); observer.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Default 3D Avatar ─────────────────────────────────────────────────────────

function DefaultAvatar({ color }: { color: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full opacity-40 animate-pulse-slow"
        style={{ background: `radial-gradient(circle, ${color}66 0%, transparent 70%)` }} />
      {/* SVG person */}
      <svg viewBox="0 0 120 120" className="w-32 h-32 relative z-10" fill="none">
        {/* Head */}
        <circle cx="60" cy="38" r="20" fill={color} opacity="0.9" />
        {/* Body */}
        <path d="M28 95 Q28 68 60 68 Q92 68 92 95" fill={color} opacity="0.7" />
        {/* Inner glow */}
        <circle cx="60" cy="38" r="12" fill="white" opacity="0.15" />
      </svg>
      {/* Floating particles */}
      <div className="absolute w-2 h-2 rounded-full animate-float-slow opacity-60"
        style={{ background: color, top: '15%', right: '20%', animationDelay: '0s' }} />
      <div className="absolute w-1.5 h-1.5 rounded-full animate-float-slow opacity-40"
        style={{ background: color, bottom: '20%', left: '15%', animationDelay: '1s' }} />
      <div className="absolute w-1 h-1 rounded-full animate-float-slow opacity-50"
        style={{ background: color, top: '50%', left: '5%', animationDelay: '2s' }} />
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────

export default function PublicPortfolioClient({ data }: { data: any }) {
  const theme    = THEME_COLORS[data.theme] ?? THEME_COLORS.indigo;
  const avatarRef = useRef<HTMLDivElement>(null!);
  useTilt(avatarRef, 10);
  useReveal();

  const initials = data.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??';

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen text-white" style={{ background: '#030712' }}>
      <style>{`
        ${BASE_STYLES}
        :root { --primary: ${theme.primary}; --glow: ${theme.glow}; --accent: ${theme.accent}; }
      `}</style>

      {/* ── Ambient background ───────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb orb-1" style={{ background: `radial-gradient(circle, ${theme.primary}44, transparent 65%)` }} />
        <div className="orb orb-2" style={{ background: `radial-gradient(circle, #4f46e588, transparent 65%)` }} />
        <div className="orb orb-3" style={{ background: `radial-gradient(circle, ${theme.primary}22, transparent 65%)` }} />
        {/* Grid overlay */}
        <div className="grid-overlay" />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-bold text-sm" style={{ color: theme.primary }}>{data.name}</span>
        <div className="hidden sm:flex items-center gap-6 text-xs text-white/40">
          {['about', 'skills', 'experience', 'projects'].map(s => (
            <button key={s} onClick={() => scrollTo(s)}
              className="hover:text-white/80 capitalize transition-colors">{s}</button>
          ))}
        </div>
        {data.email && (
          <a href={`mailto:${data.email}`}
            className="text-xs px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg,${theme.primary},${theme.accent})` }}>
            Contact
          </a>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section id="hero" className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left: text */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: `${theme.primary}18`, border: `1px solid ${theme.primary}33`, color: theme.accent }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.primary }} />
            {data.location ?? 'Available for opportunities'}
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-3">
            <span className="block text-white/90">Hi, I'm</span>
            <span className="block gradient-name">{data.name}</span>
          </h1>

          {data.title && (
            <p className="text-xl font-medium mb-5" style={{ color: theme.accent }}>{data.title}</p>
          )}

          {/* Social + CTA */}
          <div className="flex flex-wrap items-center gap-3">
            {data.github_url && (
              <a href={data.github_url} target="_blank" rel="noreferrer"
                className="social-btn">
                <GithubIcon /> GitHub
              </a>
            )}
            {data.linkedin_url && (
              <a href={data.linkedin_url} target="_blank" rel="noreferrer"
                className="social-btn">
                <LinkedinIcon /> LinkedIn
              </a>
            )}
            {data.website_url && (
              <a href={data.website_url} target="_blank" rel="noreferrer"
                className="social-btn">
                🌐 Website
              </a>
            )}
            <button onClick={() => scrollTo('projects')}
              className="cta-btn"
              style={{ background: `linear-gradient(135deg,${theme.primary},${theme.accent})` }}>
              View Projects →
            </button>
          </div>
        </div>

        {/* Right: 3D avatar card */}
        <div className="flex justify-center lg:justify-end">
          <div ref={avatarRef} className="avatar-card"
            style={{ boxShadow: `0 0 80px ${theme.glow}, 0 30px 80px rgba(0,0,0,0.6)`, transition: 'transform 0.1s ease' }}>
            {data.photo_url ? (
              <img src={data.photo_url} alt={data.name}
                className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${theme.primary}22, #0f172a)` }}>
                <DefaultAvatar color={theme.primary} />
              </div>
            )}
            {/* Initials overlay when no photo */}
            {!data.photo_url && (
              <div className="absolute inset-0 flex items-end p-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                  style={{ background: `linear-gradient(135deg,${theme.primary},${theme.accent})` }}>
                  {initials}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────── */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20">
        <SectionHeading title="About Me" color={theme.primary} />
        <div className="reveal glass-section rounded-2xl p-8 mt-8">
          <p className="text-white/65 text-base leading-relaxed max-w-3xl">
            {data.bio ?? 'No bio provided yet.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {data.location && <StatChip icon="📍" label={data.location} color={theme.primary} />}
            {data.email    && <StatChip icon="✉️" label={data.email}    color={theme.primary} />}
            {data.experience?.length > 0 && (
              <StatChip icon="💼" label={`${data.experience.length} ${data.experience.length === 1 ? 'role' : 'roles'}`} color={theme.primary} />
            )}
            {data.projects?.length > 0 && (
              <StatChip icon="🚀" label={`${data.projects.length} projects`} color={theme.primary} />
            )}
          </div>
        </div>
      </section>

      {/* ── SKILLS ───────────────────────────────────────────────────── */}
      {data.skills?.length > 0 && (
        <section id="skills" className="max-w-6xl mx-auto px-6 py-20">
          <SectionHeading title="Skills" color={theme.primary} />
          <div className="mt-8 space-y-6">
            {data.skills.map((group: any, gi: number) => (
              <div key={gi} className="reveal glass-section rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: theme.accent }}>
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items?.map((skill: string, si: number) => (
                    <span key={si} className="skill-chip"
                      style={{ '--chip-color': theme.primary, '--chip-glow': theme.glow } as any}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EXPERIENCE ───────────────────────────────────────────────── */}
      {data.experience?.length > 0 && (
        <section id="experience" className="max-w-6xl mx-auto px-6 py-20">
          <SectionHeading title="Experience" color={theme.primary} />
          <div className="mt-8 relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-3 bottom-3 w-px hidden sm:block"
              style={{ background: `linear-gradient(to bottom, ${theme.primary}, transparent)` }} />

            <div className="space-y-6">
              {data.experience.map((exp: any, i: number) => (
                <div key={i} className="reveal flex gap-6 sm:pl-12 relative">
                  {/* Timeline dot */}
                  <div className="absolute left-2 top-6 w-5 h-5 rounded-full border-2 hidden sm:flex items-center justify-center shrink-0"
                    style={{ background: '#030712', borderColor: theme.primary }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: theme.primary }} />
                  </div>

                  <div className="glass-section rounded-2xl p-6 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-white text-lg">{exp.role}</h3>
                        <p className="text-sm font-medium" style={{ color: theme.accent }}>{exp.company}</p>
                      </div>
                      <span className="text-xs px-3 py-1.5 rounded-full text-white/50 shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {exp.duration}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-white/55 leading-relaxed mb-4 whitespace-pre-line">{exp.description}</p>
                    )}
                    {exp.tech?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {exp.tech.map((t: string, ti: number) => (
                          <span key={ti} className="text-xs px-2.5 py-1 rounded-full"
                            style={{ background: `${theme.primary}18`, color: theme.accent, border: `1px solid ${theme.primary}30` }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROJECTS ─────────────────────────────────────────────────── */}
      {data.projects?.length > 0 && (
        <section id="projects" className="max-w-6xl mx-auto px-6 py-20">
          <SectionHeading title="Projects" color={theme.primary} />
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.projects.map((proj: any, i: number) => (
              <ProjectCard key={i} proj={proj} theme={theme} />
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="max-w-6xl mx-auto px-6 py-16 text-center border-t border-white/5 mt-10">
        <p className="text-2xl font-bold text-white mb-2">Let's work together</p>
        {data.email && (
          <a href={`mailto:${data.email}`} className="text-lg hover:underline transition-colors"
            style={{ color: theme.accent }}>{data.email}</a>
        )}
        <div className="flex justify-center gap-4 mt-6">
          {data.github_url   && <a href={data.github_url}   target="_blank" rel="noreferrer" className="social-btn"><GithubIcon /> GitHub</a>}
          {data.linkedin_url && <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="social-btn"><LinkedinIcon /> LinkedIn</a>}
          {data.website_url  && <a href={data.website_url}  target="_blank" rel="noreferrer" className="social-btn">🌐 Website</a>}
        </div>
        <div className="mt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-white/20 hover:text-white/50 transition-colors">
            <span>Built with</span>
            <span className="font-semibold" style={{ color: theme.accent }}>Resume Builder</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ── ProjectCard (3D tilt) ─────────────────────────────────────────────────────

function ProjectCard({ proj, theme }: { proj: any; theme: any }) {
  const ref = useRef<HTMLDivElement>(null!);
  useTilt(ref, 8);

  return (
    <div ref={ref} className="reveal project-card glass-section rounded-2xl overflow-hidden"
      style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'default' }}>
      {/* Gradient banner */}
      <div className={`h-24 bg-gradient-to-br ${proj.gradient ?? 'from-indigo-500 to-purple-600'} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-20 font-black text-white">{proj.name?.charAt(0)}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-white text-base mb-2">{proj.name}</h3>
        {proj.description && (
          <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-3">{proj.description}</p>
        )}
        {proj.tech?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {proj.tech.map((t: string, i: number) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${theme.primary}18`, color: theme.accent, border: `1px solid ${theme.primary}28` }}>
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-auto">
          {proj.live_url && (
            <a href={proj.live_url} target="_blank" rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white flex items-center gap-1"
              style={{ background: `linear-gradient(135deg,${theme.primary},${theme.accent})` }}>
              Live ↗
            </a>
          )}
          {proj.github_url && (
            <a href={proj.github_url} target="_blank" rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg text-white/60 flex items-center gap-1"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <GithubIcon size={12} /> Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

function SectionHeading({ title, color }: { title: string; color: string }) {
  return (
    <div className="reveal flex items-center gap-4">
      <h2 className="text-3xl font-black text-white">{title}</h2>
      <div className="flex-1 h-px max-w-xs" style={{ background: `linear-gradient(to right, ${color}60, transparent)` }} />
    </div>
  );
}

function StatChip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <span className="flex items-center gap-2 text-sm px-4 py-2 rounded-full text-white/60"
      style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      {icon} {label}
    </span>
  );
}

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ── Global styles ─────────────────────────────────────────────────────────────

const BASE_STYLES = `
  * { box-sizing: border-box; }

  .orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .orb-1 { width: 700px; height: 700px; top: -200px; right: -200px; opacity: 0.18; animation: drift 18s ease-in-out infinite; }
  .orb-2 { width: 500px; height: 500px; bottom: 10%; left: -150px; opacity: 0.12; animation: drift 22s ease-in-out 4s infinite reverse; }
  .orb-3 { width: 300px; height: 300px; top: 50%; left: 40%; opacity: 0.08; animation: drift 15s ease-in-out 8s infinite; }

  .grid-overlay {
    position: absolute; inset: 0; opacity: 0.025;
    background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  @keyframes drift {
    0%, 100% { transform: translate(0,0) scale(1); }
    33%       { transform: translate(30px,-30px) scale(1.05); }
    66%       { transform: translate(-20px,20px) scale(0.97); }
  }

  .gradient-name {
    background: linear-gradient(135deg, var(--primary), var(--accent), white 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .glass-section {
    background: rgba(255,255,255,0.028);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(12px);
  }

  .avatar-card {
    position: relative;
    width: 280px; height: 320px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.1);
    overflow: hidden;
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: perspective(800px) translateY(0px); }
    50%       { transform: perspective(800px) translateY(-14px); }
  }

  .social-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px; font-size: 13px;
    color: rgba(255,255,255,0.6); transition: all 0.2s;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .social-btn:hover { color: white; background: rgba(255,255,255,0.1); transform: translateY(-1px); }

  .cta-btn {
    display: inline-flex; align-items: center;
    padding: 10px 22px; border-radius: 12px; font-size: 14px;
    font-weight: 700; color: white; transition: all 0.2s; border: none; cursor: pointer;
  }
  .cta-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

  .skill-chip {
    display: inline-flex; align-items: center;
    padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 500;
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary) 35%, transparent);
    color: var(--accent);
    transition: all 0.2s;
  }
  .skill-chip:hover {
    background: color-mix(in srgb, var(--primary) 25%, transparent);
    box-shadow: 0 0 16px var(--glow);
    transform: translateY(-2px);
  }

  /* Scroll reveal */
  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .reveal.revealed { opacity: 1; transform: translateY(0); }

  /* Animations */
  @keyframes animate-float-slow {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  .animate-float-slow { animation: animate-float-slow 3s ease-in-out infinite; }
  .animate-pulse-slow  { animation: pulse 3s ease-in-out infinite; }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
