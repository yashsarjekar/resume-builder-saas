"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: number;
  question_number: number;
  question_text: string;
  category: string;
  difficulty: string;
  tip: string | null;
}

interface FeedbackData {
  question_number: number;
  score: number;
  score_label: string;
  score_color: string;
  strengths: string[];
  improvements: string[];
  ideal_answer_hint: string;
  next_question: Question | null;
  session_complete: boolean;
}

type UIPhase = "loading" | "question" | "submitted" | "complete";

// ─── Score Ring (animated SVG) ────────────────────────────────────────────────

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(
      () => setOffset(circ - (score / 10) * circ),
      200
    );
    return () => clearTimeout(t);
  }, [score, circ]);

  const colorMap: Record<string, string> = {
    green: "#22c55e",
    yellow: "#f59e0b",
    red: "#ef4444",
  };
  const stroke = colorMap[color] ?? "#6366f1";

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" className="block">
      {/* Track */}
      <circle
        cx="64" cy="64" r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="8"
      />
      {/* Progress */}
      <circle
        cx="64" cy="64" r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
      {/* Score text */}
      <text
        x="64" y="60"
        textAnchor="middle"
        fill="white"
        fontSize="26"
        fontWeight="700"
        fontFamily="inherit"
      >
        {score.toFixed(1)}
      </text>
      <text
        x="64" y="80"
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        fontSize="11"
        fontFamily="inherit"
      >
        /10
      </text>
    </svg>
  );
}

// ─── Category badge colours ───────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, string> = {
  technical:     "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  behavioral:    "bg-blue-500/20   text-blue-300   border border-blue-500/30",
  situational:   "bg-amber-500/20  text-amber-300  border border-amber-500/30",
  role_specific: "bg-rose-500/20   text-rose-300   border border-rose-500/30",
};

const DIFFICULTY_STYLE: Record<string, string> = {
  easy:   "text-green-400",
  medium: "text-amber-400",
  hard:   "text-red-400",
};

const CATEGORY_LABEL: Record<string, string> = {
  technical:     "Technical",
  behavioral:    "Behavioral",
  situational:   "Situational",
  role_specific: "Role-Specific",
};

// ─── Page component ───────────────────────────────────────────────────────────

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [phase, setPhase]             = useState<UIPhase>("loading");
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [jobRole, setJobRole]         = useState("");
  const [currentQ, setCurrentQ]       = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);   // 0-based
  const [answer, setAnswer]           = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback]       = useState<FeedbackData | null>(null);
  const [showTip, setShowTip]         = useState(false);
  const [flipDone, setFlipDone]       = useState(false);
  const [error, setError]             = useState("");

  // Voice recording
  const [isRecording, setIsRecording]   = useState(false);
  const [voiceError, setVoiceError]     = useState("");
  const recognitionRef = useRef<any>(null);
  const answerRef      = useRef<HTMLTextAreaElement>(null);
  const voiceBaseRef   = useRef<string>("");  // text captured before recording started

  // ── Load session from localStorage (set by the setup page) ────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`interview_session_${sessionId}`);
      if (raw) {
        const data = JSON.parse(raw);
        setQuestions(data.questions);
        setJobRole(data.job_role ?? "");
        setCurrentQ(data.questions[0]);
        setCurrentIndex(0);
        setPhase("question");
        // Trigger flip animation
        setTimeout(() => setFlipDone(true), 600);
      } else {
        // Session data not in sessionStorage — redirect back
        router.replace("/tools/interview");
      }
    } catch {
      router.replace("/tools/interview");
    }
  }, [sessionId, router]);

  // ── Voice recording ────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceError("Voice input not supported in this browser");
      return;
    }

    // Snapshot what's already typed so we can append voice on top of it
    voiceBaseRef.current = answer.trimEnd();

    const rec: any = new SpeechRecognitionAPI();
    rec.continuous    = true;
    rec.interimResults = true;
    rec.lang          = "en-IN";

    rec.onresult = (e: any) => {
      // Rebuild only from the results delivered in THIS event batch
      // to avoid re-joining already-committed results
      let interim = "";
      let final   = "";
      for (let i = 0; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += text + " ";
        else interim += text;
      }
      setAnswer(voiceBaseRef.current + (voiceBaseRef.current ? " " : "") + final + interim);
      // Advance base when a chunk is finalised
      if (final) voiceBaseRef.current = (voiceBaseRef.current + (voiceBaseRef.current ? " " : "") + final).trimEnd();
    };

    rec.onerror = () => {
      setVoiceError("Voice recording error. Please type your answer.");
      setIsRecording(false);
    };

    rec.onend = () => setIsRecording(false);

    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
    setVoiceError("");
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  // ── Submit answer ──────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!currentQ || answer.trim().length < 20) {
      setError("Please write a more detailed answer (at least 20 characters).");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview/${sessionId}/answer/${currentQ.question_number}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answer_text:   answer.trim(),
            answer_method: isRecording ? "voice" : "text",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail?.message ?? data.detail ?? "Failed to submit answer.");
        setIsSubmitting(false);
        return;
      }

      setFeedback(data);
      setPhase(data.session_complete ? "complete" : "submitted");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Move to next question ──────────────────────────────────────────────────
  function handleNext() {
    if (!feedback?.next_question) return;
    setCurrentQ(feedback.next_question);
    setCurrentIndex((i) => i + 1);
    setAnswer("");
    setFeedback(null);
    setShowTip(false);
    setFlipDone(false);
    setPhase("question");
    setTimeout(() => setFlipDone(true), 600);
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your interview session…</p>
        </div>
      </div>
    );
  }

  // ── Complete state ─────────────────────────────────────────────────────────
  if (phase === "complete" && feedback) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <style>{globalStyles}</style>
        <div className="glass-card max-w-lg w-full p-10 text-center rounded-3xl">
          {/* Confetti-like shimmer */}
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
          <p className="text-white/50 mb-8">
            All 10 questions answered. Your report is ready.
          </p>
          <Link
            href={`/tools/interview/${sessionId}/report`}
            className="inline-block px-8 py-4 rounded-xl text-white font-semibold text-lg"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
          >
            View Full Report →
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const progress = ((currentIndex) / questions.length) * 100;
  const remaining = questions.length - currentIndex - 1;

  // ── Main interview UI ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <style>{globalStyles}</style>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
          style={{ width: `${progress}%`, transition: "width 0.6s ease" }}
        />
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/tools/interview"
            className="text-white/40 hover:text-white/80 transition-colors"
            title="Exit interview"
          >
            ✕
          </Link>
          <span className="text-sm text-white/50 font-medium">{jobRole}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/40">Question</span>
          <span className="font-bold text-white">{currentIndex + 1}</span>
          <span className="text-white/40">/ {questions.length}</span>
        </div>
        <div className="text-sm text-white/40">
          {remaining > 0 ? `${remaining} left` : "Last question"}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Question card ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Flip card */}
          <div
            className="question-card"
            style={{ perspective: "1200px" }}
          >
            <div
              className="question-card-inner glass-card rounded-2xl p-7"
              style={{
                transform: flipDone ? "rotateY(0deg)" : "rotateY(-90deg)",
                transition: "transform 0.6s cubic-bezier(.4,0,.2,1)",
                transformStyle: "preserve-3d",
                minHeight: "220px",
              }}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    CATEGORY_STYLE[currentQ.category] ?? "bg-white/10 text-white/60"
                  }`}
                >
                  {CATEGORY_LABEL[currentQ.category] ?? currentQ.category}
                </span>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    DIFFICULTY_STYLE[currentQ.difficulty] ?? "text-white/40"
                  }`}
                >
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Question text */}
              <p className="text-white text-lg leading-relaxed font-medium">
                {currentQ.question_text}
              </p>
            </div>
          </div>

          {/* Tip toggle */}
          {currentQ.tip && phase === "question" && (
            <div>
              <button
                onClick={() => setShowTip((v) => !v)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <span>{showTip ? "▼" : "▶"}</span>
                {showTip ? "Hide tip" : "Show interviewer tip"}
              </button>
              {showTip && (
                <div className="mt-2 px-4 py-3 rounded-xl text-sm text-amber-200/80"
                  style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
                >
                  💡 {currentQ.tip}
                </div>
              )}
            </div>
          )}

          {/* Progress dots */}
          <div className="flex gap-2 mt-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  background:
                    i < currentIndex
                      ? "rgba(99,102,241,0.8)"
                      : i === currentIndex
                      ? "rgba(168,85,247,0.9)"
                      : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Right: Answer + Feedback ────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Answer panel (shown during question phase) */}
          {phase === "question" && (
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white/70">Your Answer</label>
                {/* Voice button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isRecording
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : "bg-white/5 text-white/50 border border-white/10 hover:text-white/80"
                  }`}
                >
                  <span>{isRecording ? "⏹" : "🎙️"}</span>
                  {isRecording ? "Stop" : "Voice"}
                </button>
              </div>

              {voiceError && (
                <p className="text-xs text-red-400">{voiceError}</p>
              )}

              <textarea
                ref={answerRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here… Be specific and use real examples from your experience."
                rows={8}
                className="w-full bg-transparent text-white/90 text-sm leading-relaxed resize-none outline-none placeholder-white/25 border border-white/10 rounded-xl p-3 focus:border-purple-500/50"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">{answer.length} chars</span>
                <span className="text-xs text-white/30">min 20 chars to submit</span>
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || answer.trim().length < 20}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isSubmitting
                    ? "rgba(124,58,237,0.4)"
                    : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Evaluating…
                  </span>
                ) : (
                  "Submit Answer →"
                )}
              </button>
            </div>
          )}

          {/* Feedback panel (shown after submission) */}
          {(phase === "submitted" || phase === "complete") && feedback && (
            <div className="feedback-panel glass-card rounded-2xl p-6 flex flex-col gap-5">

              {/* Score ring + label */}
              <div className="flex items-center gap-5">
                <ScoreRing score={feedback.score} color={feedback.score_color} />
                <div>
                  <div
                    className="text-xl font-bold mb-1"
                    style={{
                      color:
                        feedback.score_color === "green"
                          ? "#22c55e"
                          : feedback.score_color === "yellow"
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {feedback.score_label}
                  </div>
                  <p className="text-xs text-white/40">Question {feedback.question_number} score</p>
                </div>
              </div>

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">
                    ✓ Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-green-400 mt-0.5 shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {feedback.improvements.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                    ⚡ Improvements
                  </h4>
                  <ul className="space-y-1.5">
                    {feedback.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ideal answer hint */}
              {feedback.ideal_answer_hint && (
                <div
                  className="rounded-xl p-4 text-sm text-indigo-200/70 leading-relaxed"
                  style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}
                >
                  <span className="font-semibold text-indigo-300">Ideal answer: </span>
                  {feedback.ideal_answer_hint}
                </div>
              )}

              {/* Action button */}
              {phase === "submitted" && (
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-xl font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
                >
                  Next Question ({currentIndex + 2}/{questions.length}) →
                </button>
              )}

              {phase === "complete" && (
                <Link
                  href={`/tools/interview/${sessionId}/report`}
                  className="block w-full py-3.5 rounded-xl font-semibold text-white text-center"
                  style={{ background: "linear-gradient(135deg,#059669,#0d9488)" }}
                >
                  View Full Report →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Global styles ─────────────────────────────────────────────────────────────

const globalStyles = `
  .glass-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
  }
  .feedback-panel {
    animation: feedbackSlideIn 0.4s cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes feedbackSlideIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
