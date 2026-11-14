"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, FlaskConical, Lightbulb, Presentation, Target, AlertTriangle, Sparkles } from "lucide-react";
import { Icon } from "../Icon";
import Quiz from "../Quiz";
import { CodeTabs } from "../CodeBlock";
import VisualRenderer from "../visuals/VisualRenderer";
import { getModule, LABS, MODULES } from "@/lib/course";
import { useProgress } from "@/lib/client/progress";

const CALLOUT = {
  tip: { icon: Lightbulb, cls: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100", label: "Tip" },
  trainer: { icon: Presentation, cls: "border-amber-400/40 bg-amber-500/10 text-amber-100", label: "Trainer note" },
  warn: { icon: AlertTriangle, cls: "border-rose-400/40 bg-rose-500/10 text-rose-100", label: "Watch out" },
  insight: { icon: Sparkles, cls: "border-violet-400/40 bg-violet-500/10 text-violet-100", label: "Insight" },
};

export default function ModuleView({ id }: { id: number }) {
  const m = getModule(id)!;
  const { progress, toggleSection } = useProgress();
  const [active, setActive] = useState(m.sections[0].id);
  const prev = MODULES.find((x) => x.id === id - 1);
  const next = MODULES.find((x) => x.id === id + 1);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("s-", ""))),
      { rootMargin: "-30% 0px -60% 0px" },
    );
    m.sections.forEach((s) => {
      const el = document.getElementById(`s-${s.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [m]);

  const doneCount = m.sections.filter((s) => progress.sections.includes(`${m.id}:${s.id}`)).length;

  return (
    <div>
      {/* hero */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-20`} />
        <div className="grid-bg absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <Link href="/learn" className="mb-4 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
            <ArrowLeft size={12} /> All modules
          </Link>
          <div className="flex flex-wrap items-start gap-5">
            <div className={`rounded-2xl bg-gradient-to-br ${m.gradient} p-4 shadow-2xl`}>
              <Icon name={m.icon} size={36} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span className="font-bold">Module {m.id}</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {m.minutes} minutes
                </span>
                <span>
                  {doneCount}/{m.sections.length} sections done
                </span>
              </div>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">{m.title}</h1>
              <p className="mt-2 text-lg text-white/70">{m.tagline}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {m.objectives.map((o) => (
              <div key={o} className="flex gap-2 rounded-xl bg-black/30 p-3 text-sm backdrop-blur">
                <Target size={16} className="mt-0.5 shrink-0" style={{ color: m.accent }} />
                {o}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[230px_1fr]">
        {/* toc */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">In this module</div>
            {m.sections.map((s) => {
              const done = progress.sections.includes(`${m.id}:${s.id}`);
              return (
                <a
                  key={s.id}
                  href={`#s-${s.id}`}
                  className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition ${active === s.id ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}
                >
                  {done ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" /> : <Circle size={14} className="mt-0.5 shrink-0 opacity-40" />}
                  <span>
                    <span className="mr-1 font-mono text-xs" style={{ color: m.accent }}>
                      {s.id}
                    </span>
                    {s.title}
                  </span>
                </a>
              );
            })}
            <a href="#trainer" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/55 hover:text-white">
              <Presentation size={14} /> Trainer run-sheet
            </a>
            <a href="#quiz" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/55 hover:text-white">
              <Sparkles size={14} /> Knowledge check
            </a>
          </div>
        </aside>

        <div className="min-w-0 space-y-16">
          {m.sections.map((s) => {
            const done = progress.sections.includes(`${m.id}:${s.id}`);
            const lab = s.lab ? LABS.find((l) => l.id === s.lab) : null;
            const C = s.callout ? CALLOUT[s.callout.kind] : null;
            return (
              <section key={s.id} id={`s-${s.id}`} className="scroll-mt-24 space-y-5">
                <div className="flex items-start gap-3">
                  <span className="mt-1 rounded-lg px-2 py-0.5 font-mono text-sm font-bold text-black" style={{ background: m.accent }}>
                    {s.id}
                  </span>
                  <h2 className="text-2xl font-black sm:text-3xl">{s.title}</h2>
                </div>
                <p className="max-w-4xl text-[17px] leading-relaxed text-white/80">{s.intro}</p>

                {s.visuals?.map((v, i) => (
                  <VisualRenderer key={i} v={v} />
                ))}

                {s.points && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {s.points.map((p) => (
                      <div key={p.t} className="rounded-2xl border-l-4 bg-white/[0.03] p-4" style={{ borderColor: m.accent }}>
                        <div className="font-semibold">{p.t}</div>
                        <p className="mt-1 text-sm leading-relaxed text-white/65">{p.d}</p>
                      </div>
                    ))}
                  </div>
                )}

                {s.table && (
                  <div className="glass overflow-x-auto rounded-2xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: m.accent + "22" }}>
                          {s.table.headers.map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-bold" style={{ color: m.accent }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.rows.map((r, i) => (
                          <tr key={i} className="border-t border-white/5 hover:bg-white/[0.03]">
                            {r.map((c, j) => (
                              <td key={j} className={`px-4 py-2.5 ${j === 0 ? "font-semibold" : "text-white/75"}`}>
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {s.code && <CodeTabs samples={s.code} />}

                {C && s.callout && (
                  <div className={`flex gap-3 rounded-2xl border p-4 text-sm ${C.cls}`}>
                    <C.icon size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <b>{C.label}:</b> {s.callout.text}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => toggleSection(`${m.id}:${s.id}`)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${done ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200" : "border-white/15 hover:bg-white/5"}`}
                  >
                    {done ? <CheckCircle2 size={16} /> : <Circle size={16} />} {done ? "Completed" : "Mark as complete"}
                  </button>
                  {lab && (
                    <Link href={`/labs/${lab.id}`} className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${lab.gradient} px-4 py-2 text-sm font-semibold shadow-lg`}>
                      <FlaskConical size={16} /> Hands-on Lab {lab.id}: {lab.title} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </section>
            );
          })}

          <section id="trainer" className="scroll-mt-24">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <Presentation className="text-amber-300" /> Trainer run-sheet
            </h2>
            <div className="relative space-y-3 border-l-2 border-dashed border-amber-400/40 pl-6">
              {m.trainer.map((t) => (
                <div key={t.minute} className="relative">
                  <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-amber-400" />
                  <span className="mr-2 rounded-md bg-amber-400/20 px-2 py-0.5 font-mono text-xs text-amber-200">{t.minute} min</span>
                  <span className="text-sm text-white/80">{t.note}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="quiz" className="scroll-mt-24">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <Sparkles className="text-fuchsia-300" /> Knowledge check
            </h2>
            <Quiz moduleId={m.id} questions={m.quiz} />
          </section>

          <div className="flex justify-between gap-3 border-t border-white/10 pt-6">
            {prev ? (
              <Link href={`/learn/${prev.id}`} className="glass flex items-center gap-2 rounded-xl px-4 py-3 text-sm hover:border-white/25">
                <ArrowLeft size={16} /> Module {prev.id}: {prev.short}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/learn/${next.id}`} className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${next.gradient} px-4 py-3 text-sm font-semibold`}>
                Module {next.id}: {next.short} <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/labs" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-3 text-sm font-semibold">
                Go to the labs <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
