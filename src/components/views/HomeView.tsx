"use client";

import Link from "next/link";
import { ArrowRight, Award, Bot, CheckCircle2, Clock, FlaskConical, GraduationCap, Layers } from "lucide-react";
import GraphCanvas from "../GraphCanvas";
import { Icon } from "../Icon";
import { useGroq } from "../KeyProvider";
import { ARCHITECTURE, LABS, MODULES, OUTCOMES, PREREQS } from "@/lib/course";
import { ENTERPRISE_KG } from "@/lib/kg/data";
import { useProgress } from "@/lib/client/progress";

const MOD_COLORS = ["#c084fc", "#38bdf8", "#34d399", "#fb923c", "#f472b6", "#818cf8"];

function AgendaDonut() {
  const total = MODULES.reduce((s, m) => s + m.minutes, 0);
  const R = 80;
  const C = 2 * Math.PI * R;
  const offsets = MODULES.map((_, i) => MODULES.slice(0, i).reduce((s, x) => s + (x.minutes / total) * C, 0));
  return (
    <div className="relative mx-auto h-[220px] w-[220px]">
      <svg viewBox="0 0 220 220" className="-rotate-90">
        {MODULES.map((m, i) => {
          const len = (m.minutes / total) * C;
          return (
            <circle key={m.id} cx={110} cy={110} r={R} fill="none" stroke={MOD_COLORS[i]} strokeWidth={26} strokeDasharray={`${len - 3} ${C - len + 3}`} strokeDashoffset={-offsets[i]} className="transition-all" />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-black">{total / 60}h</div>
        <div className="text-xs text-white/60">{total} minutes · 6 modules</div>
      </div>
    </div>
  );
}

export default function HomeView() {
  const { hasKey, openSettings } = useGroq();
  const { progress } = useProgress();
  const totalSections = MODULES.reduce((s, m) => s + m.sections.length, 0);
  const pct = Math.round((progress.sections.length / totalSections) * 100);
  const handsOn = LABS.reduce((s, l) => s + l.minutes, 0);

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* HERO */}
      <section className="grid items-center gap-8 py-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="fade-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
            <GraduationCap size={14} /> 5-hour technical training · Intermediate → Advanced
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Graph RAG &amp; <span className="grad-text">Knowledge Graphs</span> for AI
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">
            From traditional knowledge representation to intelligent graph-based retrieval and agentic AI, with visual explanations and real hands-on labs in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/learn/1" className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 px-6 py-3 font-semibold shadow-lg shadow-fuchsia-500/20 hover:brightness-110">
              Start learning <ArrowRight size={18} />
            </Link>
            <Link href="/labs" className="flex items-center gap-2 rounded-2xl border border-white/15 px-6 py-3 font-semibold hover:bg-white/5">
              <FlaskConical size={18} /> Hands-on labs
            </Link>
            <Link href="/assistant" className="flex items-center gap-2 rounded-2xl border border-white/15 px-6 py-3 font-semibold hover:bg-white/5">
              <Bot size={18} /> AI tutor
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <Layers size={15} className="text-violet-300" /> 6 modules · {totalSections} sections
            </span>
            <span className="flex items-center gap-1.5">
              <FlaskConical size={15} className="text-pink-300" /> 6 labs · {handsOn} min hands-on
            </span>
            <span className="flex items-center gap-1.5">
              <Bot size={15} className="text-cyan-300" /> LangGraph agent · Groq BYOK
            </span>
          </div>
          {!hasKey && (
            <button onClick={openSettings} className="mt-5 rounded-xl border border-orange-400/40 bg-orange-500/10 px-4 py-2 text-sm text-orange-100 hover:bg-orange-500/20">
              🔑 Add your free Groq API key to unlock the AI Assistant &amp; LLM labs
            </button>
          )}
        </div>
        <div className="float relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-cyan-400/30 blur-2xl" />
          <GraphCanvas data={ENTERPRISE_KG} height={440} className="relative" />
        </div>
      </section>

      {/* PROGRESS */}
      {progress.sections.length > 0 && (
        <section className="glass mb-10 flex flex-wrap items-center gap-4 rounded-2xl p-4">
          <Award className="text-amber-300" />
          <div className="flex-1">
            <div className="mb-1 text-sm font-semibold">Your progress: {pct}%</div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="text-xs text-white/60">
            {progress.sections.length}/{totalSections} sections · {Object.keys(progress.quiz).length}/6 quizzes · {progress.labs.length}/6 labs
          </div>
        </section>
      )}

      {/* AGENDA */}
      <section className="py-8">
        <h2 className="mb-2 text-3xl font-black">Five-hour training agenda</h2>
        <p className="mb-6 text-white/60">300 minutes across 6 modules. Hands-on time is woven into Modules 2, 3 and 5.</p>
        <div className="grid items-center gap-6 lg:grid-cols-[260px_1fr]">
          <AgendaDonut />
          <div className="grid gap-3 sm:grid-cols-2">
            {MODULES.map((m, i) => {
              const done = m.sections.filter((s) => progress.sections.includes(`${m.id}:${s.id}`)).length;
              return (
                <Link key={m.id} href={`/learn/${m.id}`} className="glass group relative overflow-hidden rounded-2xl p-4 transition hover:-translate-y-1 hover:border-white/25">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${m.gradient}`} />
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl bg-gradient-to-br ${m.gradient} p-2.5`}>
                      <Icon name={m.icon} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Module {m.id}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {m.minutes} min
                        </span>
                      </div>
                      <div className="font-bold leading-tight">{m.title}</div>
                      <div className="mt-1 text-xs text-white/55">{m.tagline}</div>
                      <div className="mt-2 h-1 rounded-full bg-white/10">
                        <div className="h-1 rounded-full" style={{ width: `${(done / m.sections.length) * 100}%`, background: MOD_COLORS[i] }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* HANDS ON */}
      <section className="py-8">
        <h2 className="mb-2 text-3xl font-black">Practical hands-on distribution</h2>
        <p className="mb-6 text-white/60">{handsOn} minutes of building, spread across the day.</p>
        <div className="glass rounded-2xl p-5">
          <div className="space-y-3">
            {LABS.map((l) => (
              <Link key={l.id} href={`/labs/${l.id}`} className="group grid grid-cols-[28px_1fr] items-center gap-3 sm:grid-cols-[28px_280px_1fr]">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${l.gradient} text-xs font-bold`}>{l.id}</span>
                <span className="text-sm font-medium group-hover:text-fuchsia-200">
                  {l.title} {progress.labs.includes(l.id) && <CheckCircle2 size={13} className="inline text-emerald-300" />}
                </span>
                <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                  <div className={`h-5 rounded-r-lg bg-gradient-to-r ${l.gradient} transition-all group-hover:brightness-125`} style={{ width: `${(l.minutes / 20) * 100}%` }} />
                  <span className="text-xs text-white/60">{l.minutes} min</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="grid gap-6 py-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-3xl font-black">Recommended end-to-end architecture</h2>
          <p className="mb-4 text-white/60">The central technical takeaway of the training.</p>
          <div className="space-y-1.5">
            {ARCHITECTURE.map((a, i) => (
              <div key={a.layer} className="fade-up flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2" style={{ background: `linear-gradient(90deg, ${MOD_COLORS[i % 6]}22, transparent)`, animationDelay: `${i * 50}ms` }}>
                <Icon name={a.icon} size={16} style={{ color: MOD_COLORS[i % 6] }} />
                <span className="w-40 text-sm font-semibold">{a.layer}</span>
                <span className="text-sm text-white/65">{a.tech}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-3xl font-black">Learning outcomes</h2>
          <p className="mb-4 text-white/60">By the end of the session, participants will be able to:</p>
          <div className="grid gap-2">
            {OUTCOMES.map((o, i) => (
              <div key={o} className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black" style={{ background: MOD_COLORS[i % 6] }}>
                  {i + 1}
                </span>
                {o}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREREQS */}
      <section className="py-8">
        <h2 className="mb-4 text-3xl font-black">Preparation &amp; prerequisites</h2>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PREREQS.map(([a, b], i) => (
            <div key={a} className="glass rounded-xl p-3">
              <div className="text-[11px] uppercase tracking-wider" style={{ color: MOD_COLORS[i % 6] }}>
                {a}
              </div>
              <div className="text-sm font-semibold">{b}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
