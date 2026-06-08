"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, Trophy, Share2 } from "lucide-react";
import { burst, celebrate } from "@/lib/confetti";
import { recordQuiz } from "@/lib/progress";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  /** funny explanation shown after answering */
  explain: string;
}

export function InteractiveQuiz({
  slug,
  title = "Belt Check",
  questions,
}: {
  slug: string;
  title?: string;
  questions: QuizQuestion[];
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const answered = picked !== null;

  const choose = (i: number, ev: React.MouseEvent) => {
    if (answered) return;
    setPicked(i);
    if (i === q.correct) {
      setScore((s) => s + 1);
      burst(ev.clientX / window.innerWidth, ev.clientY / window.innerHeight);
    }
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setPicked(null);
    } else {
      const finalScore = score; // already includes current
      const pct = Math.round((finalScore / questions.length) * 100);
      recordQuiz(slug, pct);
      if (pct >= 80) celebrate();
      setDone(true);
    }
  };

  const reset = () => {
    setIdx(0); setPicked(null); setScore(0); setDone(false);
  };

  const pct = Math.round((score / questions.length) * 100);

  const share = () => {
    const text = `I scored ${score}/${questions.length} on the "${title}" quiz at the System Design Dojo 🥋⚡`;
    if (navigator.share) {
      navigator.share({ title: "System Design Dojo", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  };

  return (
    <div className="card neon-border overflow-hidden p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-neon-yellow" />
          <h3 className="font-display text-lg font-bold text-white">{title}</h3>
        </div>
        {/* progress dots */}
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full transition"
              style={{
                background:
                  i < idx || (done) ? "var(--neon-green)"
                  : i === idx && !done ? "var(--neon-blue)"
                  : "rgba(255,255,255,0.12)",
                boxShadow: i === idx && !done ? "0 0 8px var(--neon-blue)" : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <p className="mb-4 text-lg text-white">
              <span className="mono mr-2 text-neon-blue">Q{idx + 1}.</span>
              {q.question}
            </p>

            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correct;
                const isPicked = picked === i;
                const showState = answered && (isCorrect || isPicked);
                return (
                  <motion.button
                    key={i}
                    onClick={(e) => choose(i, e)}
                    disabled={answered}
                    animate={answered && isPicked && !isCorrect ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                      !answered && "border-[var(--border-subtle)] hover:border-[var(--border-neon)] hover:bg-neon-blue/5",
                      showState && isCorrect && "border-neon-green/60 bg-neon-green/10 text-neon-green",
                      showState && isPicked && !isCorrect && "border-neon-red/60 bg-neon-red/10 text-neon-red",
                      answered && !showState && "border-[var(--border-subtle)] opacity-50"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-md mono text-xs",
                        !answered && "bg-white/5 text-ink-secondary",
                        showState && isCorrect && "bg-neon-green/20 text-neon-green",
                        showState && isPicked && !isCorrect && "bg-neon-red/20 text-neon-red"
                      )}
                    >
                      {showState && isCorrect ? <Check size={13} strokeWidth={3} />
                        : showState && isPicked && !isCorrect ? <X size={13} strokeWidth={3} />
                        : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-ink-primary">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-4 rounded-xl border p-3 text-sm"
                    style={{
                      borderColor: picked === q.correct ? "var(--neon-green)" : "var(--neon-red)",
                      background: picked === q.correct ? "rgba(0,255,136,0.07)" : "rgba(255,51,102,0.07)",
                    }}
                  >
                    <span className="mr-1.5 font-semibold" style={{ color: picked === q.correct ? "var(--neon-green)" : "var(--neon-red)" }}>
                      {picked === q.correct ? "Correct!" : "Not quite."}
                    </span>
                    <span className="text-ink-secondary">{q.explain}</span>
                  </div>
                  <button onClick={next} className="btn-neon mt-4 w-full justify-center">
                    {idx + 1 < questions.length ? "Next question →" : "See my score →"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center"
          >
            <div className="text-5xl">{pct >= 80 ? "🏆" : pct >= 50 ? "👏" : "💪"}</div>
            <div className="mt-3 font-display text-4xl font-extrabold">
              <span style={{ color: pct >= 80 ? "var(--neon-green)" : pct >= 50 ? "var(--neon-yellow)" : "var(--neon-red)" }}>
                {score}/{questions.length}
              </span>
            </div>
            <p className="mt-2 text-ink-secondary">
              {pct >= 80 ? "Sensei would be proud. 🥋" : pct >= 50 ? "Solid. One more pass and you've got it." : "Re-read the section and try again — no shame in the dojo."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="btn-ghost">
                <RotateCcw size={15} /> Retry
              </button>
              <button onClick={share} className="btn-neon">
                <Share2 size={15} /> Share Result
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
