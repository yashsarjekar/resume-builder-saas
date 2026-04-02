"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionDetail {
  question_number: number;
  question_text: string;
  category: string;
  difficulty: string;
  answer_text: string;
  score: number;
  score_label: string;
  score_color: string;
  strengths: string[];
  improvements: string[];
  ideal_answer_hint: string | null;
}

interface ReportData {
  session_id: number;
  job_role: string;
  overall_score: number;
  readiness_level: string;
  readiness_label: string;
  score_technical: number | null;
  score_behavioral: number | null;
  score_situational: number | null;
  score_role_specific: number | null;
  top_strengths: string[];
  top_improvements: string[];
  questions: QuestionDetail[];
  completed_at: string | null;
}

// ─── Confetti canvas ──────────────────────────────────────────────────────────

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf        = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#7c3aed","#a78bfa","#6366f1","#f59e0b","#22c55e","#ec4899","#38bdf8"];
    const COUNT  = 150;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; angle: number; spin: number; alpha: number;
    }

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height * 0.4 - 20,
      vx:    (Math.random() - 0.5) * 4,
      vy:    Math.random() * 3 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size:  Math.random() * 8 + 4,
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.3,
      alpha: 1,
    }));

    const DURATION = 3500; // ms
    const start    = performance.now();

    function draw(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const p of particles) {
        p.x     += p.vx;
        p.y     += p.vy;
        p.angle += p.spin;
        p.vy    += 0.07; // gravity
        p.alpha  = Math.max(0, 1 - progress * 1.4);

        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.angle);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx!.restore();
      }

      if (progress < 1) {
        raf.current = requestAnimationFrame(draw);
      } else {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    }

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}

// ─── Animated overall score ring ─────────────────────────────────────────────

function OverallRing({ score, level }: { score: number; level: string }) {
  const r    = 80;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 400);
    return () => clearTimeout(t);
  }, [score, circ]);

  const levelColors: Record<string, string> = {
    confident:       "#22c55e",
    interview_ready: "#3b82f6",
    needs_work:      "#f59e0b",
    not_ready:       "#ef4444",
  };
  const stroke = levelColors[level] ?? "#6366f1";

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="block mx-auto">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r={r}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12"
      />
      <circle cx="100" cy="100" r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 100 100)"
        filter="url(#glow)"
        style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x="100" y="92" textAnchor="middle" fill="white"
        fontSize="40" fontWeight="800" fontFamily="inherit"
      >
        {score.toFixed(0)}
      </text>
      <text x="100" y="115" textAnchor="middle" fill="rgba(255,255,255,0.4)"
        fontSize="13" fontFamily="inherit"
      >
        out of 100
      </text>
    </svg>
  );
}

// ─── Category bar ─────────────────────────────────────────────────────────────

function CategoryBar({ label, score, color }: { label: string; score: number | null; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score ?? 0), 600);
    return () => clearTimeout(t);
  }, [score]);

  if (score === null) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-white/60 print:text-gray-600">{label}</span>
        <span className="font-semibold text-white print:text-gray-900">{score.toFixed(0)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 print:bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, background: color, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </div>
    </div>
  );
}

// ─── Expandable question row ──────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, string> = {
  technical:     "bg-purple-500/20 text-purple-300",
  behavioral:    "bg-blue-500/20 text-blue-300",
  situational:   "bg-amber-500/20 text-amber-300",
  role_specific: "bg-rose-500/20 text-rose-300",
};
const CATEGORY_LABEL: Record<string, string> = {
  technical: "Technical", behavioral: "Behavioral",
  situational: "Situational", role_specific: "Role-Specific",
};

function QuestionRow({ q, index }: { q: QuestionDetail; index: number }) {
  const [open, setOpen] = useState(false);

  const colorMap: Record<string, string> = {
    green: "#22c55e", yellow: "#f59e0b", red: "#ef4444",
  };
  const scoreColor = colorMap[q.score_color] ?? "#6366f1";

  return (
    <div className="glass-card print:border print:border-gray-200 print:shadow-none rounded-xl overflow-hidden print:mb-4 print:break-inside-avoid">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors print:hidden"
      >
        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: "rgba(99,102,241,0.15)", color: "#a78bfa" }}
        >
          {index + 1}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_STYLE[q.category] ?? "bg-white/10 text-white/60"}`}>
          {CATEGORY_LABEL[q.category] ?? q.category}
        </span>
        <span className="flex-1 text-sm text-white/70 truncate">{q.question_text}</span>
        <span className="text-sm font-bold shrink-0 px-2 py-0.5 rounded-full"
          style={{ color: scoreColor, background: `${scoreColor}15` }}
        >
          {q.score.toFixed(1)}
        </span>
        <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {/* Print version always expanded */}
      <div className={`px-5 pb-5 border-t border-white/5 pt-4 ${open ? "block" : "hidden"} print:block`}>
        {/* Print header */}
        <div className="hidden print:flex items-center gap-3 mb-3">
          <span className="font-bold text-gray-800">Q{index + 1}.</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
            {CATEGORY_LABEL[q.category] ?? q.category}
          </span>
          <span className="ml-auto font-bold" style={{ color: scoreColor }}>{q.score.toFixed(1)}/10</span>
        </div>

        <p className="text-sm text-white/80 print:text-gray-800 leading-relaxed">{q.question_text}</p>

        <div className="mt-3">
          <h5 className="text-xs font-semibold text-white/40 print:text-gray-500 uppercase tracking-wider mb-1.5">Your Answer</h5>
          <p className="text-sm text-white/60 print:text-gray-700 leading-relaxed italic">{q.answer_text || "—"}</p>
        </div>

        {q.strengths.length > 0 && (
          <div className="mt-3">
            <h5 className="text-xs font-semibold text-green-400 print:text-green-700 uppercase tracking-wider mb-1.5">✓ Strengths</h5>
            <ul className="space-y-1">
              {q.strengths.map((s, i) => (
                <li key={i} className="text-sm text-white/60 print:text-gray-700 flex gap-2">
                  <span className="text-green-400 shrink-0">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {q.improvements.length > 0 && (
          <div className="mt-3">
            <h5 className="text-xs font-semibold text-amber-400 print:text-amber-700 uppercase tracking-wider mb-1.5">⚡ Improvements</h5>
            <ul className="space-y-1">
              {q.improvements.map((imp, i) => (
                <li key={i} className="text-sm text-white/60 print:text-gray-700 flex gap-2">
                  <span className="text-amber-400 shrink-0">•</span>{imp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {q.ideal_answer_hint && (
          <div className="mt-3 rounded-lg p-3 text-sm text-indigo-200/60 print:text-indigo-900 print:bg-indigo-50 print:border print:border-indigo-200 leading-relaxed"
            style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)" }}
          >
            <span className="font-semibold text-indigo-300 print:text-indigo-700">Ideal approach: </span>
            {q.ideal_answer_hint}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Readiness config ─────────────────────────────────────────────────────────

const READINESS_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  confident:       { emoji: "🚀", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  interview_ready: { emoji: "✅", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  needs_work:      { emoji: "📈", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  not_ready:       { emoji: "💪", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InterviewReportPage() {
  const params    = useParams();
  const router    = useRouter();
  const sessionId = params.sessionId as string;

  const [report, setReport]       = useState<ReportData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/interview/${sessionId}/report`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 401) { router.push("/login"); return; }
        if (res.status === 403) { router.push("/pricing"); return; }
        if (!res.ok) {
          const d = await res.json();
          setError(d.detail ?? "Failed to load report.");
          setLoading(false);
          return;
        }
        const data: ReportData = await res.json();
        setReport(data);

        // Fire confetti for scores ≥ 65 (interview_ready or confident)
        if (data.overall_score >= 65) {
          setTimeout(() => setShowConfetti(true), 800);
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [sessionId, router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your report…</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Report not found."}</p>
          <Link href="/tools/interview" className="text-purple-400 hover:text-purple-300">
            ← Back to Interview
          </Link>
        </div>
      </div>
    );
  }

  const readiness = READINESS_CONFIG[report.readiness_level] ?? READINESS_CONFIG["not_ready"];
  const completedDate = report.completed_at
    ? new Date(report.completed_at).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#050816] print:bg-white text-white print:text-gray-900">
      <style>{globalStyles}</style>

      {/* Confetti overlay */}
      <Confetti active={showConfetti} />

      {/* Header — hidden on print */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between print:hidden">
        <Link href="/tools/interview" className="text-white/40 hover:text-white/80 text-sm transition-colors">
          ← All Sessions
        </Link>
        <h1 className="text-sm font-semibold text-white/60">Interview Report</h1>
        <div className="flex items-center gap-3">
          {completedDate && (
            <span className="text-xs text-white/30">{completedDate}</span>
          )}
          {/* PDF download button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20"
          >
            <span>⬇</span> Export PDF
          </button>
        </div>
      </header>

      {/* Print-only header */}
      <div className="hidden print:block px-8 py-6 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interview Report — {report.job_role}</h1>
        {completedDate && <p className="text-sm text-gray-500 mt-1">Completed {completedDate}</p>}
        <p className="text-sm text-gray-500">resumebuilder.pulsestack.in</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 print:px-8 print:py-4 space-y-8">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="glass-card print:border print:border-gray-200 print:shadow-none rounded-3xl p-8 text-center print:rounded-xl">
          <p className="text-white/50 print:text-gray-500 text-sm mb-1">{report.job_role}</p>
          <h2 className="text-2xl font-bold text-white print:text-gray-900 mb-6">Your Interview Score</h2>

          <OverallRing score={report.overall_score} level={report.readiness_level} />

          <div className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-base font-semibold"
            style={{ background: readiness.bg, color: readiness.color, border: `1px solid ${readiness.color}30` }}
          >
            {readiness.emoji} {report.readiness_label}
          </div>
        </div>

        {/* ── Category breakdown ──────────────────────────────────────────── */}
        <div className="glass-card print:border print:border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/60 print:text-gray-500 uppercase tracking-wider mb-5">
            Category Breakdown
          </h3>
          <div className="space-y-4">
            <CategoryBar label="Technical"     score={report.score_technical}     color="#a78bfa" />
            <CategoryBar label="Behavioral"    score={report.score_behavioral}    color="#60a5fa" />
            <CategoryBar label="Situational"   score={report.score_situational}   color="#fbbf24" />
            <CategoryBar label="Role-Specific" score={report.score_role_specific} color="#f87171" />
          </div>
        </div>

        {/* ── Strengths + Improvements ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.top_strengths.length > 0 && (
            <div className="glass-card print:border print:border-gray-200 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-green-400 print:text-green-700 uppercase tracking-wider mb-3">
                ✓ Top Strengths
              </h3>
              <ul className="space-y-2">
                {report.top_strengths.map((s, i) => (
                  <li key={i} className="text-sm text-white/70 print:text-gray-700 flex gap-2">
                    <span className="text-green-400 shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.top_improvements.length > 0 && (
            <div className="glass-card print:border print:border-gray-200 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-amber-400 print:text-amber-700 uppercase tracking-wider mb-3">
                ⚡ Areas to Improve
              </h3>
              <ul className="space-y-2">
                {report.top_improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-white/70 print:text-gray-700 flex gap-2">
                    <span className="text-amber-400 shrink-0">•</span>{imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Per-question breakdown ──────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-semibold text-white/60 print:text-gray-500 uppercase tracking-wider mb-4">
            Question-by-Question Review
          </h3>
          <div className="space-y-2">
            {report.questions.map((q, i) => (
              <QuestionRow key={q.question_number} q={q} index={i} />
            ))}
          </div>
        </div>

        {/* ── CTA — hidden on print ───────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-6 text-center print:hidden">
          <p className="text-white/60 text-sm mb-4">Ready to practice again?</p>
          <Link
            href="/tools/interview"
            className="inline-block px-8 py-3.5 rounded-xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
          >
            Start New Interview →
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const globalStyles = `
  .glass-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
  }
  @media print {
    body { background: white !important; }
    .glass-card { background: white !important; backdrop-filter: none !important; }
    @page { margin: 1cm; }
  }
`;
