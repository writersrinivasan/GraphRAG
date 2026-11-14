"use client";

import { useState } from "react";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { QuizQ } from "@/lib/course/types";
import { useProgress } from "@/lib/client/progress";

export default function Quiz({ moduleId, questions }: { moduleId: number; questions: QuizQ[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const { setQuiz } = useProgress();
  const done = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a === questions[i].answer).length;

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const a = answers[qi];
        return (
          <div key={qi} className="glass rounded-2xl p-5">
            <p className="mb-3 font-semibold">
              <span className="mr-2 text-fuchsia-300">Q{qi + 1}.</span>
              {q.q}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, oi) => {
                const chosen = a === oi;
                const correct = oi === q.answer;
                const cls =
                  a === null
                    ? "border-white/10 hover:border-fuchsia-400/60 hover:bg-white/5"
                    : correct
                      ? "border-emerald-400/70 bg-emerald-500/15"
                      : chosen
                        ? "border-rose-400/70 bg-rose-500/15"
                        : "border-white/5 opacity-50";
                return (
                  <button
                    key={oi}
                    disabled={a !== null}
                    onClick={() => {
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                      if (next.every((x) => x !== null)) setQuiz(moduleId, next.filter((x, i) => x === questions[i].answer).length);
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${cls}`}
                  >
                    {a !== null && correct && <CheckCircle2 size={16} className="shrink-0 text-emerald-300" />}
                    {a !== null && chosen && !correct && <XCircle size={16} className="shrink-0 text-rose-300" />}
                    {o}
                  </button>
                );
              })}
            </div>
            {a !== null && <p className="mt-3 text-sm text-white/70">💡 {q.why}</p>}
          </div>
        );
      })}
      {done && (
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-fuchsia-600/40 to-cyan-600/40 p-5">
          <div className="flex items-center gap-3">
            <Award size={32} className="text-amber-300" />
            <div>
              <div className="text-lg font-bold">
                Score: {score} / {questions.length}
              </div>
              <div className="text-sm text-white/70">{score === questions.length ? "Perfect! 🎉" : score >= questions.length / 2 ? "Nice work. Review the misses above." : "Revisit the sections and try again."}</div>
            </div>
          </div>
          <button onClick={() => setAnswers(questions.map(() => null))} className="flex items-center gap-1 rounded-xl bg-black/30 px-3 py-2 text-sm hover:bg-black/50">
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}
    </div>
  );
}
