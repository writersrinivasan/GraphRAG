"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Maximize2, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Icon } from "../Icon";
import { LABS, MODULES } from "@/lib/course";

const PREFLIGHT = [
  "Projector test: open this app full-screen (zoom 110–125%)",
  "Your Groq key saved in Settings; test it with “Test key & load models”",
  "Neo4j AuraDB Free instance created; credentials .env ready",
  "Learners told to create a Groq key (console.groq.com) and AuraDB account beforehand",
  "Python 3.11+ & VS Code installed on learner machines",
  "Backup: Labs 1, 2, 4, 5 work offline without any key",
];

function fmt(s: number) {
  const m = Math.floor(Math.abs(s) / 60);
  const ss = Math.abs(s) % 60;
  return `${s < 0 ? "-" : ""}${m}:${String(ss).padStart(2, "0")}`;
}

export default function TrainerView() {
  const [mod, setMod] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<Set<number>>(new Set());
  const m = MODULES[mod];
  const total = m.minutes * 60;
  const remaining = total - elapsed;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const minute = Math.floor(elapsed / 60);
  const currentNote = m.trainer.findIndex((t) => {
    const [a, b] = t.minute.split("–").map(Number);
    return minute >= a && minute < b;
  });
  const pct = Math.min(100, (elapsed / total) * 100);
  const dayStart = MODULES.slice(0, mod).reduce((s, x) => s + x.minutes, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">
            Trainer <span className="grad-text">console</span>
          </h1>
          <p className="mt-2 text-white/65">Module timer, live run-sheet, and a day overview for running the 5-hour session.</p>
        </div>
        <button onClick={() => document.documentElement.requestFullscreen?.()} className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
          <Maximize2 size={14} /> Presenter full-screen
        </button>
      </div>

      {/* Day bar */}
      <div className="mt-6 flex h-12 overflow-hidden rounded-2xl border border-white/10">
        {MODULES.map((x, i) => (
          <button
            key={x.id}
            onClick={() => {
              setMod(i);
              setElapsed(0);
              setRunning(false);
            }}
            className={`relative flex items-center justify-center bg-gradient-to-r ${x.gradient} text-xs font-bold transition ${i === mod ? "opacity-100" : "opacity-35 hover:opacity-70"}`}
            style={{ width: `${(x.minutes / 300) * 100}%` }}
          >
            M{x.id} · {x.minutes}m
          </button>
        ))}
      </div>
      <div className="mt-1 text-right text-[11px] text-white/45">
        Day clock: {fmt((dayStart * 60 + elapsed))} of 5:00:00 planned
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass flex flex-col items-center rounded-3xl p-6">
          <div className="text-sm text-white/60">Module {m.id}</div>
          <div className="text-center text-xl font-bold">{m.title}</div>
          <div className="relative my-6 h-56 w-56">
            <svg viewBox="0 0 200 200" className="-rotate-90">
              <circle cx={100} cy={100} r={88} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={14} />
              <circle cx={100} cy={100} r={88} fill="none" stroke={remaining < 0 ? "#f43f5e" : m.accent} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${(pct / 100) * 553} 553`} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`font-mono text-5xl font-black tabular-nums ${remaining < 0 ? "text-rose-400" : ""}`}>{fmt(remaining)}</div>
              <div className="text-xs text-white/50">{remaining < 0 ? "over time" : "remaining"}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRunning((r) => !r)} className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${m.gradient} px-5 py-2.5 font-semibold`}>
              {running ? <Pause size={16} /> : <Play size={16} />} {running ? "Pause" : "Start"}
            </button>
            <button onClick={() => setElapsed(0)} className="rounded-xl border border-white/15 px-3" aria-label="Reset timer">
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => {
                setMod((x) => Math.min(MODULES.length - 1, x + 1));
                setElapsed(0);
              }}
              className="rounded-xl border border-white/15 px-3"
              aria-label="Next module"
            >
              <SkipForward size={16} />
            </button>
          </div>
          <Link href={`/learn/${m.id}`} className="mt-4 text-sm text-fuchsia-300 hover:underline">
            Open Module {m.id} content →
          </Link>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-5">
            <h3 className="mb-3 font-bold">Run-sheet</h3>
            <div className="space-y-2">
              {m.trainer.map((t, i) => (
                <div key={t.minute} className={`flex gap-3 rounded-xl p-3 transition ${i === currentNote && running ? "bg-amber-400/15 ring-1 ring-amber-400/60" : i < currentNote ? "opacity-50" : "bg-white/[0.03]"}`}>
                  <span className="shrink-0 rounded-md bg-amber-400/20 px-2 py-0.5 font-mono text-xs text-amber-200">{t.minute}</span>
                  <span className="text-sm">{t.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <h3 className="mb-3 font-bold">Labs in this module</h3>
            <div className="flex flex-wrap gap-2">
              {LABS.filter((l) => l.module === m.id).map((l) => (
                <Link key={l.id} href={`/labs/${l.id}`} className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${l.gradient} px-3 py-2 text-sm font-semibold`}>
                  <Icon name={l.icon} size={14} /> Lab {l.id} · {l.minutes}m
                </Link>
              ))}
              {!LABS.some((l) => l.module === m.id) && <span className="text-sm text-white/50">Concept module, no dedicated lab. Use the in-page interactive visuals.</span>}
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <h3 className="mb-3 font-bold">Pre-flight checklist</h3>
            {PREFLIGHT.map((p, i) => (
              <label key={p} className="flex cursor-pointer items-start gap-2 py-1 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 accent-fuchsia-500"
                  checked={checks.has(i)}
                  onChange={() => {
                    const n = new Set(checks);
                    if (n.has(i)) n.delete(i);
                    else n.add(i);
                    setChecks(n);
                  }}
                />
                <span className={checks.has(i) ? "text-white/40 line-through" : ""}>{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
