"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, MapPin, Network, Search, X } from "lucide-react";
import GraphCanvas from "../GraphCanvas";
import { CodeBlock } from "../CodeBlock";
import { CATEGORY_COLORS, GLOSSARY, GlossaryCategory, GlossaryTerm } from "@/lib/course/glossary";
import type { GraphData } from "@/lib/kg/types";

const CATS = Object.keys(CATEGORY_COLORS) as GlossaryCategory[];
const BY_ID = new Map(GLOSSARY.map((g) => [g.id, g]));

const CONCEPT_MAP: GraphData = (() => {
  const seen = new Set<string>();
  const edges: GraphData["edges"] = [];
  GLOSSARY.forEach((g) =>
    g.related.forEach((r) => {
      const k = [g.id, r].sort().join("|");
      if (seen.has(k)) return;
      seen.add(k);
      edges.push({ id: k, source: g.id, target: r, type: "RELATED" });
    }),
  );
  return {
    nodes: GLOSSARY.map((g) => ({ id: g.id, label: g.category, name: g.term, props: { name: g.term, category: g.category, meaning: g.short } })),
    edges,
  };
})();

function TermCard({ g, open, onToggle, onJump }: { g: GlossaryTerm; open: boolean; onToggle: () => void; onJump: (id: string) => void }) {
  const c = CATEGORY_COLORS[g.category];
  return (
    <div
      id={`term-${g.id}`}
      className={`glass scroll-mt-24 overflow-hidden rounded-2xl transition ${open ? "ring-1" : "hover:border-white/25"}`}
      style={open ? ({ "--tw-ring-color": c } as React.CSSProperties) : undefined}
    >
      <button onClick={onToggle} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: c }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold">{g.term}</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: c + "26", color: c }}>
              {g.category}
            </span>
          </div>
          {g.aka && <div className="text-xs text-white/45">{g.aka}</div>}
          <p className="mt-1 text-sm text-white/75">{g.short}</p>
        </div>
        <ChevronDown size={18} className={`mt-1 shrink-0 text-white/40 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="fade-up space-y-3 px-4 pb-4 pl-[34px]">
          <p className="text-sm leading-relaxed text-white/80">{g.detail}</p>
          <div className="rounded-xl border p-3" style={{ borderColor: c + "55", background: `linear-gradient(135deg, ${c}1f, transparent)` }}>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: c }}>
              <MapPin size={13} /> In this app
            </div>
            <p className="text-sm text-white/85">{g.inApp.text}</p>
            <Link href={g.inApp.href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: c }}>
              See it live → {g.inApp.where} <ArrowRight size={12} />
            </Link>
          </div>
          {g.example && <CodeBlock sample={{ title: "example", lang: g.example.lang, code: g.example.code }} />}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-white/45">Related:</span>
            {g.related.map((r) => {
              const t = BY_ID.get(r)!;
              return (
                <button
                  key={r}
                  onClick={() => onJump(r)}
                  className="rounded-full border px-2.5 py-0.5 text-xs transition hover:bg-white/10"
                  style={{ borderColor: CATEGORY_COLORS[t.category] + "66", color: CATEGORY_COLORS[t.category] }}
                >
                  {t.term}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GlossaryView() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<GlossaryCategory | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [mapSel, setMapSel] = useState<string | null>(null);

  const jump = (id: string) => {
    setQ("");
    setCat(null);
    setOpen((o) => new Set(o).add(id));
    setMapSel(id);
    requestAnimationFrame(() => document.getElementById(`term-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  useEffect(() => {
    const id = window.location.hash.replace("#term-", "");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open the deep-linked term after mount
    if (id && BY_ID.has(id)) jump(id);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return GLOSSARY.filter((g) => (!cat || g.category === cat) && (!s || `${g.term} ${g.aka ?? ""} ${g.short} ${g.detail} ${g.inApp.text}`.toLowerCase().includes(s))).sort((a, b) =>
      a.term.localeCompare(b.term),
    );
  }, [q, cat]);

  const letters = useMemo(() => [...new Set(filtered.map((g) => g.term[0].toUpperCase()))], [filtered]);
  const counts = CATS.map((c) => ({ c, n: GLOSSARY.filter((g) => g.category === c).length }));
  const mapHighlight = useMemo(() => {
    if (!q.trim() && !cat) return null;
    const ids = new Set(filtered.map((g) => g.id));
    return { nodes: [...ids], edges: CONCEPT_MAP.edges.filter((e) => ids.has(e.source) && ids.has(e.target)).map((e) => e.id) };
  }, [filtered, q, cat]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">
        Terminology <span className="grad-text">Glossary</span>
      </h1>
      <p className="mt-2 max-w-3xl text-white/65">
        {GLOSSARY.length} new terms you&apos;ll meet in this course, from <b>URI</b> and <b>RDF</b> to <b>Cypher</b>, <b>Graph RAG</b> and <b>LangGraph</b>. Each one is explained in plain words, shown
        <b> where it appears in this app</b>, and linked to related terms.
      </p>

      {/* category distribution bar */}
      <div className="mt-6 flex h-3 overflow-hidden rounded-full">
        {counts.map(({ c, n }) => (
          <div key={c} title={`${c}: ${n}`} style={{ width: `${(n / GLOSSARY.length) * 100}%`, background: CATEGORY_COLORS[c] }} />
        ))}
      </div>

      {/* controls */}
      <div className="sticky top-16 z-30 -mx-4 mt-4 space-y-3 bg-[#07051a]/85 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-3.5 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search terms… e.g. URI, RDF, MERGE, embedding, LangGraph"
            className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-10 text-sm outline-none focus:border-fuchsia-400"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-3 text-white/40 hover:text-white" aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCat(null)} className={`rounded-full border px-3 py-1 text-xs ${!cat ? "border-white/40 bg-white/15" : "border-white/10 text-white/60"}`}>
            All · {GLOSSARY.length}
          </button>
          {counts.map(({ c, n }) => (
            <button
              key={c}
              onClick={() => setCat(cat === c ? null : c)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition"
              style={{ borderColor: cat === c ? CATEGORY_COLORS[c] : "rgba(255,255,255,0.1)", background: cat === c ? CATEGORY_COLORS[c] + "26" : "transparent" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[c] }} />
              {c} <span className="text-white/45">{n}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-bold hover:bg-fuchsia-500/30">
              {l}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* terms */}
        <div className="space-y-3">
          {filtered.length === 0 && <p className="glass rounded-2xl p-6 text-center text-white/50">No terms match “{q}”.</p>}
          {filtered.map((g, i) => {
            const letter = g.term[0].toUpperCase();
            const first = i === 0 || filtered[i - 1].term[0].toUpperCase() !== letter;
            return (
              <div key={g.id}>
                {first && (
                  <div id={`letter-${letter}`} className="mb-2 mt-4 scroll-mt-48 text-2xl font-black text-white/25">
                    {letter}
                  </div>
                )}
                <TermCard
                  g={g}
                  open={open.has(g.id)}
                  onToggle={() =>
                    setOpen((o) => {
                      const n = new Set(o);
                      if (n.has(g.id)) n.delete(g.id);
                      else n.add(g.id);
                      return n;
                    })
                  }
                  onJump={jump}
                />
              </div>
            );
          })}
        </div>

        {/* concept map */}
        <aside className="lg:sticky lg:top-[230px] lg:self-start">
          <div className="glass rounded-3xl p-3">
            <div className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold">
              <Network size={16} className="text-fuchsia-300" /> Concept map
              <span className="ml-auto text-[11px] font-normal text-white/45">click a term to open it</span>
            </div>
            <GraphCanvas
              data={CONCEPT_MAP}
              height={480}
              legend={false}
              selected={mapSel}
              highlight={mapHighlight}
              nodeColor={(n) => CATEGORY_COLORS[n.label as GlossaryCategory]}
              showEdgeLabels="hover"
              onSelect={(id) => {
                if (id) jump(id);
                else setMapSel(null);
              }}
            />
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1">
              {CATS.map((c) => (
                <span key={c} className="flex items-center gap-1 text-[10px] text-white/60">
                  <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[c] }} />
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="glass mt-3 rounded-2xl p-4 text-xs text-white/60">
            💡 The glossary is a knowledge graph too: terms are nodes and “related” links are edges. The AI tutor can search it, so try asking “What is a URI in RDF?”.
          </div>
        </aside>
      </div>
    </div>
  );
}
