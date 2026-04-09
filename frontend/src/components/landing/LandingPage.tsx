import Link from 'next/link';
import ScrollRevealInit from './ScrollRevealInit';
import ResumeMockupClient from './ResumeMockupClient';
import AnimatedStats from './AnimatedStats';
import TestimonialsSection from './TestimonialsSection';

/* ─── Main LandingPage ───────────────────────────────────────────────── */
export default function LandingPage() {

  return (
    <div className="bg-[#050816] text-white overflow-x-hidden">
      <ScrollRevealInit />

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section className="aurora-bg relative min-h-[92vh] flex items-center pt-12 pb-20 px-4">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="blob absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full bg-indigo-700/15 blur-[90px]" style={{ animation: 'blob 12s infinite ease-in-out' }} />
          <div className="blob absolute top-[20%] right-[-100px] w-[400px] h-[400px] rounded-full bg-purple-700/12 blur-[80px]" style={{ animation: 'blob 15s infinite ease-in-out', animationDelay: '3s' }} />
          <div className="blob absolute bottom-[-100px] left-[35%] w-[350px] h-[350px] rounded-full bg-cyan-700/10 blur-[70px]" style={{ animation: 'blob 10s infinite ease-in-out', animationDelay: '6s' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT: Copy */}
            <div>
              {/* Headline */}
              <h1
                className="font-black leading-[1.05] tracking-[-0.03em] mb-6"
                style={{ fontSize: 'clamp(30px, 7.5vw, 46px)' }}
              >
                Land Your Dream Job<span className="hidden md:inline"><br /></span>{' '}in <span className="shimmer-text">Half the Time</span>
              </h1>

              <p className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
                AI-powered resume builder that optimizes for ATS systems, matches you to jobs, and writes tailored cover letters all in minutes.
              </p>

              {/* Social proof row */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex -space-x-2">
                  {[
                    'https://i.pravatar.cc/150?img=47',
                    'https://i.pravatar.cc/150?img=32',
                    'https://i.pravatar.cc/150?img=11',
                    'https://i.pravatar.cc/150?img=68',
                    'https://i.pravatar.cc/150?img=26',
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="user"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-[#050816] object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                    <span className="text-gray-400 ml-1">4.9/5</span>
                  </div>
                  <p className="text-xs text-gray-500">Trusted by 12,000+ professionals</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link href="/signup" className="btn-primary relative overflow-hidden flex items-center justify-center gap-2 text-base">
                  Build My Resume Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/jobs" className="flex items-center justify-center gap-2 text-base font-semibold px-7 py-[14px] rounded-xl border border-white/30 text-white hover:bg-white/8 hover:border-white/50 transition-all duration-200">
                  Browse Jobs
                </Link>
              </div>
              <p className="text-xs text-gray-600">No credit card required · Free forever plan available</p>

              {/* Hired at */}
              <div className="mt-10 pt-8 border-t border-white/5">
                <p className="mb-4" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Professionals hired at
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { name: 'Google',   icon: 'google' },
                    { name: 'Amazon',   icon: null },
                    { name: 'Flipkart', icon: null },
                    { name: 'Razorpay', icon: 'razorpay' },
                    { name: 'Infosys',  icon: null },
                    { name: 'TCS',      icon: null },
                    { name: 'Zepto',    icon: null },
                  ].map(({ name, icon }) => (
                    <div
                      key={name}
                      className="group flex items-center gap-2 cursor-default transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '20px',
                        padding: '6px 18px',
                      }}
                    >
                      {icon ? (
                        <img
                          src={`https://cdn.simpleicons.org/${icon}/ffffff`}
                          alt={name}
                          height={16}
                          width={16}
                          className="opacity-50 group-hover:opacity-90 transition-opacity duration-200"
                          style={{ height: '16px', width: '16px', objectFit: 'contain', filter: 'grayscale(1) brightness(2)' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : null}
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' }}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: 3D Resume Mockup */}
            <div className="hidden lg:flex items-center justify-center">
              <ResumeMockupClient />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ══════════════════════════════════════════════════ */}
      <AnimatedStats />

      {/* ═══ PROBLEM SECTION ════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 scroll-reveal">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Why Most Resumes <span className="gradient-text">Never Get Read</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">The job market is brutally competitive. These three invisible barriers are silently killing your chances.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'M6 18L18 6M6 6l12 12',
                color: 'from-red-500/20 to-red-600/10',
                border: 'rgba(239,68,68,0.25)',
                glow: 'rgba(239,68,68,0.15)',
                iconColor: '#f87171',
                stat: '75%',
                title: 'ATS Rejection',
                desc: "Three out of four resumes never reach a human. They're filtered out by robots before anyone reads a single word you wrote.",
              },
              {
                icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
                color: 'from-amber-500/20 to-amber-600/10',
                border: 'rgba(245,158,11,0.25)',
                glow: 'rgba(245,158,11,0.15)',
                iconColor: '#fbbf24',
                stat: '90%',
                title: 'Generic Content',
                desc: 'One-size-fits-all resumes score low on keyword matching. Each job needs its own tailored version, impossible to do manually.',
              },
              {
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                color: 'from-orange-500/20 to-orange-600/10',
                border: 'rgba(249,115,22,0.25)',
                glow: 'rgba(249,115,22,0.12)',
                iconColor: '#fb923c',
                stat: '4 hrs',
                title: 'Time Drain',
                desc: 'Professionals spend 4+ hours tailoring a single application. Multiply by 50 applications and your job search becomes a full-time job.',
              },
            ].map((card, i) => (
              <div
                key={card.title}
                className="glass-card scroll-reveal rounded-2xl p-6"
                style={{ transitionDelay: `${i * 100}ms`, borderColor: card.border, boxShadow: `0 0 30px ${card.glow}` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 border`} style={{ borderColor: card.border }}>
                  <svg className="w-6 h-6" style={{ color: card.iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div className="text-3xl font-black mb-2" style={{ color: card.iconColor }}>{card.stat}</div>
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white/[0.015]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14 scroll-reveal">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Get Hired in <span className="shimmer-text">3 Steps</span></h2>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start">
            {[
              { step: '01', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: 'Build Your Resume', desc: 'Fill in your details or import from LinkedIn. Our AI structures everything for maximum impact.' },
              { step: '02', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'AI Optimizes It', desc: 'AI analyzes your target job and rewrites your resume to score 85%+ on ATS systems.' },
              { step: '03', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', title: 'Apply & Get Hired', desc: 'Download your ATS-optimized PDF and start applying. Track your match score for every job.' },
            ].map((step, i) => (
              <div key={step.step} className="flex flex-col md:flex-row items-center md:items-start flex-1 min-w-0">
                {/* Step card */}
                <div
                  className="glass-card scroll-reveal text-center p-7 rounded-2xl w-full hover:-translate-y-1.5 hover:border-indigo-500/30 transition-all duration-300"
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* Gradient step number */}
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)', margin: '0 auto 16px' }}>
                    {i + 1}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={step.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>

                {/* Connector (between steps only) */}
                {i < 2 && (
                  <>
                    {/* Desktop arrow */}
                    <div className="hidden md:flex items-center justify-center flex-shrink-0 w-10 mt-16">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(99,102,241,0.6)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    {/* Mobile vertical line */}
                    <div className="md:hidden mx-auto my-2" style={{ width: '2px', height: '32px', background: 'linear-gradient(180deg, rgba(99,102,241,0.6), rgba(6,182,212,0.4))' }} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 scroll-reveal">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              Everything You Need to <span className="gradient-text">Get Hired Faster</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">One platform. All the AI tools recruiters never tell you about.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.2)', shadow: '0 0 20px rgba(99,102,241,0.3)', title: 'ATS Optimization', desc: 'AI scans your resume against job descriptions and rewrites it to score 85%+ on any ATS. No more silent rejections.' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.2)', shadow: '0 0 20px rgba(6,182,212,0.3)', title: 'Keyword Extraction', desc: 'Automatically pull the exact keywords, skills, and phrases recruiters are searching for in any job posting.' },
              { icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.2)', shadow: '0 0 20px rgba(139,92,246,0.3)', title: 'Pro Templates', desc: '10+ ATS-friendly templates designed by hiring experts at top companies. Beautiful, clean, and machine-readable.' },
              { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.2)', shadow: '0 0 20px rgba(245,158,11,0.3)', title: 'Cover Letter AI', desc: 'Generate a personalized, compelling cover letter for any job in 30 seconds. Tailored to the company and role.' },
              { icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.2)', shadow: '0 0 20px rgba(16,185,129,0.3)', title: 'Job ATS Match', desc: 'Browse 100,000+ remote jobs and instantly check how well your resume matches each one. Know before you apply.' },
              { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.2)', shadow: '0 0 20px rgba(59,130,246,0.3)', title: 'LinkedIn Optimizer', desc: 'Rewrite your LinkedIn headline, summary, and skills to attract 3× more recruiter messages.' },
              { icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.2)', shadow: '0 0 20px rgba(168,85,247,0.3)', title: 'AI Mock Interview', desc: 'Practice with 10 personalised interview questions generated from your resume and JD. Get instant AI scores and actionable feedback.' },
              { icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.2)', shadow: '0 0 20px rgba(99,102,241,0.3)', title: 'Portfolio Page', desc: 'Generate a stunning 3D personal portfolio page in one click. Share a single link with recruiters showcasing your skills, experience and projects.' },
            ].map((f, i) => (
              <div
                key={f.title}
                className="glass-card scroll-reveal p-6 rounded-2xl hover:-translate-y-1 hover:border-indigo-500/40 transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms`, borderColor: f.border }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: f.bg, boxShadow: f.shadow, border: `1px solid ${f.border}` }}>
                  <svg width="20" height="20" style={{ color: f.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEMPLATES ══════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white/[0.015]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 scroll-reveal">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Templates</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Resumes Built for <span className="shimmer-text">Every Role</span>
            </h2>
            <p className="text-gray-400">Role-specific templates pre-loaded with the right keywords and structure.</p>
          </div>

          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
            {[
              { href: '/resume/software-engineer', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: '#818cf8', label: 'Software Engineer', sub: 'React, Node, AWS' },
              { href: '/resume/data-analyst', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#34d399', label: 'Data Analyst', sub: 'SQL, Python, Tableau' },
              { href: '/resume/java-developer', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#fb923c', label: 'Java Developer', sub: 'Spring Boot, Microservices' },
              { href: '/resume/mba-fresher', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: '#a78bfa', label: 'MBA Fresher', sub: 'Management, Strategy' },
              { href: '/resume/product-manager', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#f472b6', label: 'Product Manager', sub: 'Roadmap, OKRs, Agile' },
              { href: '/resume/devops-engineer', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', color: '#06b6d4', label: 'DevOps Engineer', sub: 'Docker, K8s, CI/CD' },
            ].map((t, i) => (
              <Link
                key={t.href}
                href={t.href}
                className="flex-shrink-0 w-48 glass-card rounded-2xl p-5 group scroll-reveal"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-white/10" style={{ background: `${t.color}20` }}>
                  <svg className="w-5 h-5" style={{ color: t.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={t.icon} />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 mb-3">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Live Preview
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{t.label}</h3>
                <p className="text-xs text-gray-500">{t.sub}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 scroll-reveal">
            <Link href="/resume" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
              View all templates
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ BLOG ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14 scroll-reveal">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Career Intel</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Resources That <span className="gradient-text">Actually Help</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                href: '/blog/how-to-write-ats-friendly-resume',
                cat: 'Resume Tips', catColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                thumb: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                thumbIcon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                thumbColor: '#818cf8',
                title: 'How to Write an ATS-Friendly Resume in 2025', time: '5 min read',
                desc: 'The exact formula that gets resumes past robots and in front of hiring managers.',
              },
              {
                href: '/blog/top-10-resume-mistakes-freshers',
                cat: 'For Freshers', catColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                thumb: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #78350f 100%)',
                thumbIcon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
                thumbColor: '#fbbf24',
                title: 'Top 10 Resume Mistakes Fresh Graduates Make', time: '7 min read',
                desc: 'Avoid these silent killers that keep smart graduates from getting interview calls.',
              },
              {
                href: '/blog/coding-interview-tips-for-beginners',
                cat: 'Interview Prep', catColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                thumb: 'linear-gradient(135deg, #042f2e 0%, #134e4a 50%, #0f766e 100%)',
                thumbIcon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
                thumbColor: '#2dd4bf',
                title: 'Coding Interview Tips That Top 1% Follow', time: '8 min read',
                desc: 'The mental models and preparation system used by engineers who crack FAANG interviews.',
              },
            ].map((post, i) => (
              <Link
                key={post.href}
                href={post.href}
                className="glass-card scroll-reveal rounded-2xl group block overflow-hidden"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Gradient thumbnail */}
                <div style={{ height: '160px', background: post.thumb, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="48" height="48" style={{ color: post.thumbColor, opacity: 0.9 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={post.thumbIcon} />
                  </svg>
                  <span style={{ position: 'absolute', bottom: '10px', right: '12px', background: 'rgba(255,255,255,0.1)', fontSize: '11px', color: 'rgba(255,255,255,0.7)', padding: '3px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                    {post.time}
                  </span>
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-4 ${post.catColor}`}>
                    {post.cat}
                  </div>
                  <h3 className="text-base font-bold text-white mb-3 leading-snug group-hover:text-indigo-300 transition-colors">{post.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{post.desc}</p>
                  <span className="text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 scroll-reveal">
            <Link href="/blog" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
              All career tips
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════════════ */}
      <TestimonialsSection />


      {/* ═══ FINAL CTA ══════════════════════════════════════════════════ */}
      <section className="py-24 px-4" style={{ borderTop: '1px solid rgba(99,102,241,0.25)', borderBottom: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 40%, rgba(6,182,212,0.08) 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Purple orb top-left */}
        <div className="pointer-events-none" style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />
        {/* Cyan orb bottom-right */}
        <div className="pointer-events-none" style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)' }} />

        <div className="container mx-auto max-w-3xl relative text-center scroll-reveal">
          <p style={{ fontSize: '12px', color: '#06b6d4', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>
            Free plan always available
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            Ready to Land Your<br />
            <span className="shimmer-text">Dream Job?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Join 12,000+ professionals who built ATS-winning resumes in under 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-7">
            <Link href="/signup" className="btn-primary flex items-center justify-center gap-2 text-base px-8">
              Start Building for Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/pricing" className="btn-ghost flex items-center justify-center gap-2 text-base px-8">
              View Pricing
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {['No credit card required', 'Cancel anytime', 'ATS-Guaranteed'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
