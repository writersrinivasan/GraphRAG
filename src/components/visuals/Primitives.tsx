"use client";

import { ArrowRight } from "lucide-react";
import { Icon } from "../Icon";
import type { Visual } from "@/lib/course/types";

export const PALETTE = ["#c084fc", "#22d3ee", "#f472b6", "#fbbf24", "#34d399", "#fb923c", "#818cf8", "#f87171", "#2dd4bf"];

export function Flow({ v }: { v: Extract<Visual, { kind: "flow" }> }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className={`flex ${v.wrap ? "flex-wrap" : "flex-wrap lg:flex-nowrap"} items-stretch justify-center gap-2`}>
        {v.steps.map((s, i) => {
          const c = PALETTE[i % PALETTE.length];
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="fade-up group relative flex w-[132px] flex-col items-center rounded-2xl border p-3 text-center transition hover:-translate-y-1"
                style={{ borderColor: c + "55", background: `linear-gradient(180deg, ${c}22, transparent)`, animationDelay: `${i * 70}ms` }}
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2 text-[10px] font-bold text-black" style={{ background: c }}>
                  {i + 1}
                </div>
                <div className="mb-2 mt-1 rounded-xl p-2" style={{ background: c + "33", color: c }}>
                  <Icon name={s.icon} size={20} />
                </div>
                <div className="text-sm font-semibold leading-tight">{s.title}</div>
                {s.desc && <div className="mt-1 text-[11px] leading-snug text-white/60">{s.desc}</div>}
              </div>
              {i < v.steps.length - 1 && <ArrowRight size={16} className="shrink-0 text-white/30" />}
            </div>
          );
        })}
      </div>
      {v.caption && <p className="mt-4 text-center text-xs text-white/50">{v.caption}</p>}
    </div>
  );
}

export function Cards({ v }: { v: Extract<Visual, { kind: "cards" }> }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[v.cols ?? 3];
  return (
    <div className={`grid gap-3 ${cols}`}>
      {v.items.map((it, i) => {
        const c = PALETTE[i % PALETTE.length];
        return (
          <div
            key={i}
            className="fade-up glass group relative overflow-hidden rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-white/25"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40" style={{ background: c }} />
            <div className="flex items-start gap-3">
              <div className="rounded-xl p-2" style={{ background: c + "26", color: c }}>
                <Icon name={it.icon} size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{it.title}</span>
                  {it.tag && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: c + "26", color: c }}>
                      {it.tag}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-snug text-white/65">{it.desc}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Compare({ v }: { v: Extract<Visual, { kind: "compare" }> }) {
  const side = (s: typeof v.left, c: string) => (
    <div className="glass flex-1 rounded-2xl p-5" style={{ borderColor: c + "55" }}>
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-xl p-2" style={{ background: c + "26", color: c }}>
          <Icon name={s.icon} size={18} />
        </div>
        <h4 className="font-bold" style={{ color: c }}>
          {s.title}
        </h4>
      </div>
      <ul className="space-y-2">
        {s.items.map((x) => (
          <li key={x} className="flex gap-2 text-sm text-white/80">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: c }} />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="relative flex flex-col gap-3 md:flex-row">
      {side(v.left, "#22d3ee")}
      <div className="z-10 mx-auto flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-xs font-black shadow-lg md:-mx-5">
        VS
      </div>
      {side(v.right, "#f472b6")}
    </div>
  );
}

export function Bars({ v }: { v: Extract<Visual, { kind: "bars" }> }) {
  const max = v.max ?? Math.max(...v.data.flatMap((d) => d.values));
  const log = !v.max && max / Math.max(1e-6, Math.min(...v.data.flatMap((d) => d.values).filter((x) => x > 0))) > 1000;
  const scale = (x: number) => (log ? Math.max(2, (Math.log10(x * 100 + 1) / Math.log10(max * 100 + 1)) * 100) : (x / max) * 100);
  return (
    <div className="glass rounded-2xl p-5">
      {v.title && <h4 className="mb-1 font-semibold">{v.title}</h4>}
      <div className="mb-4 flex flex-wrap gap-3">
        {v.series.map((s, i) => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-white/70">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PALETTE[(i * 2) % PALETTE.length] }} />
            {s}
          </span>
        ))}
        {log && <span className="text-[10px] text-white/40">(log scale)</span>}
      </div>
      <div className="space-y-3">
        {v.data.map((d) => (
          <div key={d.label} className="grid grid-cols-[80px_1fr] items-center gap-3">
            <div className="text-right text-xs font-medium text-white/70">{d.label}</div>
            <div className="space-y-1">
              {d.values.map((x, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-3.5 rounded-r-md transition-all duration-700"
                    style={{ width: `${scale(x)}%`, background: `linear-gradient(90deg, ${PALETTE[(i * 2) % PALETTE.length]}55, ${PALETTE[(i * 2) % PALETTE.length]})` }}
                  />
                  <span className="text-[10px] tabular-nums text-white/60">{x}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {v.note && <p className="mt-4 text-[11px] text-white/45">{v.note}</p>}
    </div>
  );
}

export function Radar({ v }: { v: Extract<Visual, { kind: "radar" }> }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const R = 110;
  const n = v.axes.length;
  const pt = (i: number, val: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * R * (val / 10), cy + Math.sin(a) * R * (val / 10)];
  };
  const colors = ["#c084fc", "#22d3ee", "#fbbf24", "#f472b6"];
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-2xl p-5 md:flex-row">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px]">
        {[2, 4, 6, 8, 10].map((r) => (
          <polygon key={r} points={v.axes.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.1)" />
        ))}
        {v.axes.map((a, i) => {
          const [x, y] = pt(i, 10);
          const [lx, ly] = pt(i, 12.4);
          return (
            <g key={a}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={9.5} fill="rgba(255,255,255,0.75)">
                {a}
              </text>
            </g>
          );
        })}
        {v.series.map((s, si) => (
          <polygon
            key={s.name}
            points={s.values.map((val, i) => pt(i, val).join(",")).join(" ")}
            fill={colors[si] + "33"}
            stroke={colors[si]}
            strokeWidth={2}
            className="fade-up"
            style={{ animationDelay: `${si * 150}ms` }}
          />
        ))}
      </svg>
      <div className="space-y-2">
        {v.series.map((s, si) => (
          <div key={s.name} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm" style={{ background: colors[si] }} />
            {s.name}
          </div>
        ))}
        {v.note && <p className="max-w-[220px] pt-2 text-[11px] text-white/45">{v.note}</p>}
      </div>
    </div>
  );
}

export function Timeline({ v }: { v: Extract<Visual, { kind: "timeline" }> }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl p-5">
      <div className="relative flex min-w-[760px] justify-between gap-2 pt-2">
        <div className="absolute left-4 right-4 top-[42px] h-1 rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-pink-500" />
        {v.items.map((it, i) => {
          const c = PALETTE[i % PALETTE.length];
          return (
            <div key={i} className="fade-up relative flex w-[120px] flex-col items-center text-center" style={{ animationDelay: `${i * 90}ms` }}>
              <span className="mb-1 text-[11px] font-bold" style={{ color: c }}>
                {it.year}
              </span>
              <div className="z-10 rounded-full border-2 bg-[#0b0820] p-2" style={{ borderColor: c, color: c }}>
                <Icon name={it.icon} size={18} />
              </div>
              <div className="mt-2 text-sm font-semibold leading-tight">{it.title}</div>
              <div className="mt-1 text-[11px] leading-snug text-white/55">{it.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Stack({ v }: { v: Extract<Visual, { kind: "stack" }> }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
        {v.layers.map((l, i) => {
          const c = PALETTE[i % PALETTE.length];
          const inset = (v.layers.length - 1 - i) * 1.2;
          return (
            <div
              key={l.title}
              className="fade-up flex items-center gap-3 rounded-xl border px-4 py-2.5"
              style={{
                marginLeft: `${inset}%`,
                marginRight: `${inset}%`,
                borderColor: c + "55",
                background: `linear-gradient(90deg, ${c}30, ${c}08)`,
                animationDelay: `${(v.layers.length - i) * 70}ms`,
              }}
            >
              <div className="rounded-lg p-1.5" style={{ background: c + "33", color: c }}>
                <Icon name={l.icon} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{l.title}</div>
                <div className="text-xs text-white/60">{l.desc}</div>
              </div>
              {l.tech && <span className="hidden shrink-0 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white/75 sm:block">{l.tech}</span>}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-white/45">Data flows bottom → top. Queries flow top → bottom.</p>
    </div>
  );
}
