'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SkillGroup  { category: string; items: string[] }
interface ExpItem     { company: string; role: string; duration: string; description: string; tech: string[] }
interface ProjectItem { name: string; description: string; tech: string[]; live_url: string; github_url: string; gradient: string }

const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-fuchsia-600',
];

const THEMES = [
  { id: 'indigo',  label: 'Indigo',  color: '#6366f1' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'amber',   label: 'Amber',   color: '#f59e0b' },
  { id: 'rose',    label: 'Rose',    color: '#f43f5e' },
];

const STEPS = ['Info', 'Skills', 'Experience', 'Projects'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, user } = useAuthStore();

  const [authChecked,   setAuthChecked]   = useState(false);
  const [step,          setStep]          = useState(0);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');
  const [slugStatus,    setSlugStatus]    = useState<'idle'|'checking'|'ok'|'taken'>('idle');
  const [existingPortfolio, setExistingPortfolio] = useState<any>(null);

  // ── Step 1 fields ─────────────────────────────────────────────────────────
  const [name,        setName]        = useState('');
  const [title,       setTitle]       = useState('');
  const [bio,         setBio]         = useState('');
  const [photoUrl,    setPhotoUrl]    = useState('');
  const [email,       setEmail]       = useState('');
  const [linkedin,    setLinkedin]    = useState('');
  const [github,      setGithub]      = useState('');
  const [location,    setLocation]    = useState('');
  const [website,     setWebsite]     = useState('');
  const [slug,        setSlug]        = useState('');
  const [theme,       setTheme]       = useState('indigo');

  // ── Step 2: Skills ────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<SkillGroup[]>([
    { category: 'Technical', items: [] },
    { category: 'Tools',     items: [] },
  ]);
  const [newSkillInput, setNewSkillInput] = useState<Record<number, string>>({});

  // ── Step 3: Experience ────────────────────────────────────────────────────
  const [experience, setExperience] = useState<ExpItem[]>([]);

  // ── Step 4: Projects ──────────────────────────────────────────────────────
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    checkAuth().then(() => setAuthChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated) { router.push('/login'); return; }

    // Check plan — free users see upgrade wall
    const plan = (user as any)?.subscription_type ?? 'free';
    if (plan === 'free') return; // rendered below

    // Load existing portfolio if any
    api.get('/api/portfolio/me').then(res => {
      const p = res.data;
      setExistingPortfolio(p);
      setName(p.name ?? '');
      setTitle(p.title ?? '');
      setBio(p.bio ?? '');
      setPhotoUrl(p.photo_url ?? '');
      setEmail(p.email ?? '');
      setLinkedin(p.linkedin_url ?? '');
      setGithub(p.github_url ?? '');
      setLocation(p.location ?? '');
      setWebsite(p.website_url ?? '');
      setSlug(p.slug ?? '');
      setTheme(p.theme ?? 'indigo');
      if (p.skills?.length)     setSkills(p.skills);
      if (p.experience?.length) setExperience(p.experience);
      if (p.projects?.length)   setProjects(p.projects);
    }).catch(() => {
      // No portfolio yet — pre-fill from user profile
      const u = user as any;
      if (u?.full_name) { setName(u.full_name); setSlug(slugify(u.full_name)); }
      if (u?.email)     setEmail(u.email);
    });
  }, [authChecked, isAuthenticated, user, router]);

  // ── Slug check debounce ───────────────────────────────────────────────────
  useEffect(() => {
    if (!slug || slug.length < 2) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    const timer = setTimeout(() => {
      api.get(`/api/portfolio/check-slug/${encodeURIComponent(slug)}`)
        .then(r => setSlugStatus(r.data.available ? 'ok' : 'taken'))
        .catch(() => setSlugStatus('idle'));
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  // ── Slug auto-generate from name ──────────────────────────────────────────
  const handleNameChange = (v: string) => {
    setName(v);
    if (!existingPortfolio) setSlug(slugify(v));
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setError(''); setSaving(true);
    try {
      const payload = {
        slug, name, title, bio,
        photo_url:    photoUrl   || null,
        email:        email      || null,
        linkedin_url: linkedin   || null,
        github_url:   github     || null,
        location:     location   || null,
        website_url:  website    || null,
        skills, experience, projects, theme, is_public: true,
      };
      const res = await api.post('/api/portfolio', payload);
      setExistingPortfolio(res.data);
      setSuccess(`https://resumebuilder.pulsestack.in/portfolio/${res.data.slug}`);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to save portfolio.');
    } finally {
      setSaving(false);
    }
  };

  // ── Skills helpers ────────────────────────────────────────────────────────
  const addSkill = (groupIdx: number) => {
    const val = (newSkillInput[groupIdx] ?? '').trim();
    if (!val) return;
    setSkills(prev => prev.map((g, i) =>
      i === groupIdx ? { ...g, items: [...g.items, val] } : g
    ));
    setNewSkillInput(prev => ({ ...prev, [groupIdx]: '' }));
  };

  const removeSkill = (groupIdx: number, skillIdx: number) =>
    setSkills(prev => prev.map((g, i) =>
      i === groupIdx ? { ...g, items: g.items.filter((_, j) => j !== skillIdx) } : g
    ));

  const addSkillGroup = () =>
    setSkills(prev => [...prev, { category: 'New Category', items: [] }]);

  // ── Experience helpers ────────────────────────────────────────────────────
  const addExp = () => setExperience(prev => [
    ...prev,
    { company: '', role: '', duration: '', description: '', tech: [] }
  ]);

  const updateExp = (i: number, field: keyof ExpItem, val: any) =>
    setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const removeExp = (i: number) =>
    setExperience(prev => prev.filter((_, idx) => idx !== i));

  // ── Project helpers ───────────────────────────────────────────────────────
  const addProject = () => setProjects(prev => [
    ...prev,
    { name: '', description: '', tech: [], live_url: '', github_url: '', gradient: GRADIENTS[prev.length % GRADIENTS.length] }
  ]);

  const updateProject = (i: number, field: keyof ProjectItem, val: any) =>
    setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  const removeProject = (i: number) =>
    setProjects(prev => prev.filter((_, idx) => idx !== i));

  // ── Free user wall ────────────────────────────────────────────────────────
  const plan = (user as any)?.subscription_type ?? 'free';
  if (authChecked && isAuthenticated && plan === 'free') {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-4">
        <div className="glass-card max-w-lg w-full rounded-3xl p-10 text-center">
          <style>{STYLES}</style>
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
          <p className="text-white/50 mb-6">
            Personal Portfolio Pages are available on <span className="text-indigo-400 font-semibold">Starter</span> and{' '}
            <span className="text-purple-400 font-semibold">Pro</span> plans.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-8 py-3.5 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
          >
            Upgrade Now →
          </button>
          <button onClick={() => router.push('/dashboard')} className="block mx-auto mt-4 text-sm text-white/30 hover:text-white/60">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const themeColor = THEMES.find(t => t.id === theme)?.color ?? '#6366f1';

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <style>{STYLES}</style>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${themeColor}, transparent 70%)` }} />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: `rgba(99,102,241,0.15)`, border: '1px solid rgba(99,102,241,0.25)' }}>🌐</div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Portfolio Builder</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Portfolio</h1>
            <p className="text-white/40 mt-1 text-sm">One link. Infinite impressions.</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-white/40 hover:text-white/80 transition-colors">
            ← Dashboard
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-2 shrink-0"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: i <= step ? `${themeColor}33` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${i <= step ? themeColor : 'rgba(255,255,255,0.1)'}`,
                    color: i <= step ? themeColor : 'rgba(255,255,255,0.3)',
                  }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i === step ? 'white' : 'rgba(255,255,255,0.35)' }}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px" style={{ background: i < step ? themeColor : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Info ──────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white/90">Basic Information</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name *" value={name} onChange={v => handleNameChange(v)} placeholder="Yash Sarjekar" />
              <Field label="Job Title" value={title} onChange={setTitle} placeholder="Full Stack Developer" />
            </div>

            <div>
              <label className="field-label">Bio</label>
              <textarea
                value={bio} onChange={e => setBio(e.target.value)} rows={4}
                className="field-input w-full resize-none"
                placeholder="A short paragraph about yourself, your passion and what you build…"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Photo URL" value={photoUrl} onChange={setPhotoUrl} placeholder="https://…/photo.jpg (leave blank for 3D avatar)" />
              <Field label="Location" value={location} onChange={setLocation} placeholder="Pune, India" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" value={email} onChange={setEmail} placeholder="hello@yash.dev" />
              <Field label="Website" value={website} onChange={setWebsite} placeholder="https://yash.dev" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="LinkedIn URL" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/…" />
              <Field label="GitHub URL" value={github} onChange={setGithub} placeholder="https://github.com/…" />
            </div>

            {/* Slug */}
            <div>
              <label className="field-label">Portfolio URL slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30 shrink-0">resumebuilder.pulsestack.in/portfolio/</span>
                <div className="relative flex-1">
                  <input
                    value={slug} onChange={e => setSlug(slugify(e.target.value))}
                    className="field-input w-full pr-8"
                    placeholder="yash-sarjekar"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {slugStatus === 'checking' && <span className="text-white/30">…</span>}
                    {slugStatus === 'ok'       && <span className="text-green-400">✓</span>}
                    {slugStatus === 'taken'    && <span className="text-red-400">✗</span>}
                  </span>
                </div>
              </div>
              {slugStatus === 'taken' && <p className="text-xs text-red-400 mt-1">This slug is already taken.</p>}
            </div>

            {/* Theme */}
            <div>
              <label className="field-label">Portfolio Theme</label>
              <div className="flex gap-3 mt-1">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: theme === t.id ? `${t.color}22` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${theme === t.id ? t.color : 'rgba(255,255,255,0.1)'}`,
                      color: theme === t.id ? t.color : 'rgba(255,255,255,0.5)',
                    }}>
                    <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <StepNav onNext={() => { if (!name.trim() || !slug.trim()) { setError('Name and slug are required.'); return; } setError(''); setStep(1); }} nextLabel="Skills →" error={error} />
          </div>
        )}

        {/* ── STEP 1: Skills ────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white/90">Skills</h2>
            {skills.map((group, gi) => (
              <div key={gi} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <input
                  value={group.category}
                  onChange={e => setSkills(prev => prev.map((g, i) => i === gi ? { ...g, category: e.target.value } : g))}
                  className="field-input w-full text-sm font-semibold"
                  placeholder="Category name"
                />
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill, si) => (
                    <span key={si} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: `${themeColor}20`, border: `1px solid ${themeColor}40`, color: themeColor }}>
                      {skill}
                      <button onClick={() => removeSkill(gi, si)} className="ml-1 opacity-50 hover:opacity-100">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newSkillInput[gi] ?? ''}
                    onChange={e => setNewSkillInput(prev => ({ ...prev, [gi]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addSkill(gi)}
                    className="field-input flex-1 text-sm"
                    placeholder="Add skill… (Enter)"
                  />
                  <button onClick={() => addSkill(gi)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: `${themeColor}25`, border: `1px solid ${themeColor}40`, color: themeColor }}>
                    + Add
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addSkillGroup} className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
              + Add skill category
            </button>
            <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Experience →" />
          </div>
        )}

        {/* ── STEP 2: Experience ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white/90">Work Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} className="rounded-xl p-4 space-y-3 relative" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => removeExp(i)} className="absolute top-3 right-3 text-white/20 hover:text-red-400 text-lg leading-none">×</button>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={exp.company}  onChange={e => updateExp(i, 'company',  e.target.value)} className="field-input w-full text-sm" placeholder="Company name" />
                  <input value={exp.role}     onChange={e => updateExp(i, 'role',     e.target.value)} className="field-input w-full text-sm" placeholder="Your role / title" />
                </div>
                <input value={exp.duration}  onChange={e => updateExp(i, 'duration', e.target.value)} className="field-input w-full text-sm" placeholder="Jan 2022 – Present" />
                <textarea value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} rows={3}
                  className="field-input w-full text-sm resize-none" placeholder="What did you build / achieve? Use bullet points…" />
                <input
                  value={(exp.tech ?? []).join(', ')}
                  onChange={e => updateExp(i, 'tech', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  className="field-input w-full text-sm" placeholder="Tech stack (comma separated): React, Node.js, PostgreSQL" />
              </div>
            ))}
            <button onClick={addExp} className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
              + Add experience
            </button>
            <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Projects →" />
          </div>
        )}

        {/* ── STEP 3: Projects + Publish ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-white/90">Projects</h2>
              {projects.map((proj, i) => (
                <div key={i} className="rounded-xl p-4 space-y-3 relative" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={() => removeProject(i)} className="absolute top-3 right-3 text-white/20 hover:text-red-400 text-lg leading-none">×</button>
                  {/* Gradient picker */}
                  <div className="flex gap-2 mb-1">
                    {GRADIENTS.map(g => (
                      <button key={g} onClick={() => updateProject(i, 'gradient', g)}
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} transition-all ${proj.gradient === g ? 'ring-2 ring-white/60 scale-110' : ''}`} />
                    ))}
                  </div>
                  <input value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} className="field-input w-full text-sm font-semibold" placeholder="Project name" />
                  <textarea value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} rows={2}
                    className="field-input w-full text-sm resize-none" placeholder="Short project description…" />
                  <input
                    value={(proj.tech ?? []).join(', ')}
                    onChange={e => updateProject(i, 'tech', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    className="field-input w-full text-sm" placeholder="Tech stack: Next.js, FastAPI, PostgreSQL" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input value={proj.live_url}   onChange={e => updateProject(i, 'live_url',   e.target.value)} className="field-input w-full text-sm" placeholder="Live URL" />
                    <input value={proj.github_url} onChange={e => updateProject(i, 'github_url', e.target.value)} className="field-input w-full text-sm" placeholder="GitHub URL" />
                  </div>
                </div>
              ))}
              <button onClick={addProject} className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                + Add project
              </button>
              <StepNav onBack={() => setStep(2)} />
            </div>

            {/* Publish card */}
            <div className="glass-card rounded-2xl p-6">
              {error   && <p className="text-sm text-red-400 mb-4">{error}</p>}
              {success && (
                <div className="mb-5 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div>
                    <p className="text-sm text-green-400 font-semibold">🎉 Portfolio published!</p>
                    <p className="text-xs text-white/50 mt-0.5 break-all">{success}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => navigator.clipboard.writeText(success)}
                      className="text-xs px-3 py-1.5 rounded-lg text-white/60 hover:text-white"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Copy
                    </button>
                    <button onClick={() => window.open(success, '_blank')}
                      className="text-xs px-3 py-1.5 rounded-lg text-white font-semibold"
                      style={{ background: `linear-gradient(135deg,${themeColor},${themeColor}bb)` }}>
                      View ↗
                    </button>
                  </div>
                </div>
              )}
              <button onClick={handleSave} disabled={saving || slugStatus === 'taken'}
                className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: saving ? 'rgba(99,102,241,0.3)' : `linear-gradient(135deg,${themeColor},${themeColor}cc)` }}>
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : existingPortfolio ? '💾 Save Changes' : '🚀 Publish Portfolio'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="field-input w-full" placeholder={placeholder} />
    </div>
  );
}

function StepNav({ onBack, onNext, nextLabel = 'Next →', error }: { onBack?: () => void; onNext?: () => void; nextLabel?: string; error?: string }) {
  return (
    <div className="pt-2">
      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        {onBack ? (
          <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            ← Back
          </button>
        ) : <div />}
        {onNext && (
          <button onClick={onNext} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  .glass-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(16px);
  }
  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }
  .field-input {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 9px 13px;
    color: rgba(255,255,255,0.9);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .field-input::placeholder { color: rgba(255,255,255,0.2); }
  .field-input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.04);
  }
`;
