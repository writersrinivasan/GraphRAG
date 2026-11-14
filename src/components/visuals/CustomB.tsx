"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Bot, MessageSquare, Play } from "lucide-react";
import GraphCanvas from "../GraphCanvas";
import { Icon } from "../Icon";
import { Graph } from "@/lib/kg/graph";
import { ENTERPRISE_DOCS, ENTERPRISE_KG } from "@/lib/kg/data";
import { runCypher } from "@/lib/kg/cypher";
import { vectorSearch } from "@/lib/kg/retrieval";
import { GraphData, KGEdge, slugify } from "@/lib/kg/types";
import { PALETTE } from "./Primitives";

const Box = ({ c, children, className = "" }: { c: string; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border px-3 py-2 text-center text-xs font-medium ${className}`} style={{ borderColor: c + "77", background: `linear-gradient(135deg, ${c}2a, ${c}0d)` }}>
    {children}
  </div>
);

/* ---------------- 4.1 Embedding space ---------------- */
export function EmbeddingSpace() {
  const clusters = [
    { name: "Graph databases", c: "#22d3ee", cx: 120, cy: 90, pts: ["Neo4j stores nodes", "Cypher MATCH", "graph traversal", "index-free adjacency"] },
    { name: "HR & people", c: "#c084fc", cx: 330, cy: 70, pts: ["John's role", "team structure", "skills profile", "reporting line"] },
    { name: "Finance", c: "#fbbf24", cx: 230, cy: 210, pts: ["Q3 revenue", "budget plan", "invoice terms", "cost centre"] },
  ];
  const q = { x: 155, y: 120 };
  const pts = clusters.flatMap((cl, ci) => cl.pts.map((p, i) => ({ p, c: cl.c, x: cl.cx + Math.cos(i * 1.7 + ci) * 38, y: cl.cy + Math.sin(i * 1.7 + ci) * 30 })));
  const nearest = [...pts].sort((a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y)).slice(0, 3);
  return (
    <div className="glass grid gap-4 rounded-2xl p-4 md:grid-cols-[1.4fr_1fr]">
      <svg viewBox="0 0 440 270" className="w-full">
        <rect width={440} height={270} rx={14} fill="rgba(0,0,0,0.25)" />
        {clusters.map((cl) => (
          <g key={cl.name}>
            <circle cx={cl.cx} cy={cl.cy} r={62} fill={cl.c} opacity={0.07} />
            <text x={cl.cx} y={cl.cy - 66} textAnchor="middle" fontSize={10} fill={cl.c} fontWeight={700}>
              {cl.name}
            </text>
          </g>
        ))}
        {nearest.map((n, i) => (
          <line key={i} x1={q.x} y1={q.y} x2={n.x} y2={n.y} stroke="#fde047" strokeWidth={1.5} className="dash-move" />
        ))}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill={p.c} />
            <text x={p.x + 7} y={p.y + 3} fontSize={7.5} fill="rgba(255,255,255,0.65)">
              {p.p}
            </text>
          </g>
        ))}
        <polygon points={`${q.x},${q.y - 10} ${q.x + 3},${q.y - 3} ${q.x + 10},${q.y - 3} ${q.x + 4},${q.y + 2} ${q.x + 6},${q.y + 10} ${q.x},${q.y + 5} ${q.x - 6},${q.y + 10} ${q.x - 4},${q.y + 2} ${q.x - 10},${q.y - 3} ${q.x - 3},${q.y - 3}`} fill="#fde047" />
        <text x={q.x} y={q.y + 24} textAnchor="middle" fontSize={9} fill="#fde047" fontWeight={700}>
          query: “how does Neo4j find connections?”
        </text>
      </svg>
      <div className="space-y-2 text-sm">
        <h4 className="font-bold text-cyan-300">Embeddings = meaning as coordinates</h4>
        <p className="text-white/65">Texts with similar meaning land close together. Retrieval returns the k nearest chunks to the query (cosine similarity).</p>
        <div className="space-y-1">
          {nearest.map((n, i) => (
            <div key={i} className="rounded-lg bg-yellow-400/10 px-2 py-1 text-xs">
              top-{i + 1}: <span className="text-yellow-200">{n.p}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/45">Real embeddings have 384–3072 dimensions; this is a 2-D projection for intuition.</p>
      </div>
    </div>
  );
}

/* ---------------- 4.2 RAG limitations (live) ---------------- */
export function RagLimitations() {
  const question = "Which technologies are used by projects that Priya Sharma's team works on?";
  const top = vectorSearch(question, 3);
  const needed = new Set(["d4", "d2", "d3", "d5", "d6", "d9"]);
  const topIds = new Set(top.map((t) => t.id));
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-1 text-xs uppercase tracking-wider text-orange-300">Live demo: top-3 similarity retrieval</div>
      <div className="mb-3 font-semibold">“{question}”</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {ENTERPRISE_DOCS.map((d) => {
          const got = topIds.has(d.id);
          const need = needed.has(d.id);
          const cls = got && need ? "border-emerald-400/70 bg-emerald-500/10" : got ? "border-sky-400/60 bg-sky-500/10" : need ? "border-rose-400/70 bg-rose-500/10" : "border-white/10 opacity-50";
          return (
            <div key={d.id} className={`rounded-xl border p-2 text-[10.5px] ${cls}`}>
              <div className="mb-1 flex items-center justify-between font-semibold">
                <span className="truncate">{d.title}</span>
              </div>
              <div className="line-clamp-3 text-white/60">{d.text}</div>
              <div className="mt-1 text-[10px] font-bold">
                {got && need && <span className="text-emerald-300">✓ retrieved & needed</span>}
                {got && !need && <span className="text-sky-300">retrieved, not needed</span>}
                {!got && need && <span className="text-rose-300">✗ needed but missed</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-white/60">
        The answer needs a chain (Priya → her reports → their projects → technologies) spread over ~6 documents. Top-k similarity can&apos;t follow the chain because hop 2 depends on what hop 1 found.
      </p>
    </div>
  );
}

/* ---------------- 4.3 Graph RAG concept ---------------- */
export function GraphRagConcept() {
  const ring = (r: number, n: number, off = 0) => Array.from({ length: n }, (_, i) => [200 + Math.cos((i / n) * Math.PI * 2 + off) * r, 150 + Math.sin((i / n) * Math.PI * 2 + off) * r * 0.8]);
  const r1 = ring(70, 5, 0.3);
  const r2 = ring(130, 9, 0.1);
  return (
    <div className="glass grid gap-4 rounded-2xl p-4 md:grid-cols-[1.2fr_1fr]">
      <svg viewBox="0 0 400 300" className="w-full">
        <ellipse cx={200} cy={150} rx={130} ry={104} fill="none" stroke="#f472b6" strokeOpacity={0.3} strokeDasharray="4 4" />
        <ellipse cx={200} cy={150} rx={70} ry={56} fill="none" stroke="#fbbf24" strokeOpacity={0.4} strokeDasharray="4 4" />
        {r1.map(([x, y], i) => (
          <line key={"a" + i} x1={200} y1={150} x2={x} y2={y} stroke="#fbbf24" strokeOpacity={0.7} className="dash-move" />
        ))}
        {r2.map(([x, y], i) => {
          const [px, py] = r1[i % r1.length];
          return <line key={"b" + i} x1={px} y1={py} x2={x} y2={y} stroke="#f472b6" strokeOpacity={0.5} />;
        })}
        {r2.map(([x, y], i) => (
          <circle key={"c" + i} cx={x} cy={y} r={8} fill={PALETTE[(i + 2) % PALETTE.length]} opacity={0.8} />
        ))}
        {r1.map(([x, y], i) => (
          <circle key={"d" + i} cx={x} cy={y} r={11} fill={PALETTE[i % PALETTE.length]} />
        ))}
        <circle cx={200} cy={150} r={22} fill="#fde047" opacity={0.3} className="pulse-ring" />
        <circle cx={200} cy={150} r={16} fill="#fde047" />
        <text x={200} y={154} textAnchor="middle" fontSize={9} fontWeight={800} fill="#422006">
          SEED
        </text>
        <text x={200} y={86} textAnchor="middle" fontSize={9} fill="#fde68a">
          1-hop
        </text>
        <text x={200} y={40} textAnchor="middle" fontSize={9} fill="#fbcfe8">
          2-hop
        </text>
      </svg>
      <div className="flex flex-col justify-center gap-2 text-sm">
        {[
          ["Question", "“What does Priya's team build?”", "#c084fc"],
          ["Seed entities", "Priya Sharma → linked node", "#fde047"],
          ["Expand", "MANAGES → team, WORKS_ON → projects", "#fbbf24"],
          ["Context", "Subgraph serialised as triples + text", "#f472b6"],
          ["Generate", "LLM answers and cites the paths", "#22d3ee"],
        ].map(([a, b, c], i) => (
          <div key={a} className="fade-up flex items-center gap-2" style={{ animationDelay: `${i * 100}ms` }}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black" style={{ background: c }}>
              {i + 1}
            </span>
            <div>
              <span className="font-semibold">{a}:</span> <span className="text-white/65">{b}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 4.4 Graph RAG architecture ---------------- */
const ArchRow = ({ items }: { items: string[][] }) => (
  <div className="flex flex-wrap items-center justify-center gap-1.5">
    {items.map(([t, i, c], k) => (
      <div key={t} className="flex items-center gap-1.5">
        <Box c={c} className="w-[118px]">
          <Icon name={i} size={16} className="mx-auto mb-1" style={{ color: c }} />
          {t}
        </Box>
        {k < items.length - 1 && <ArrowRight size={14} className="text-white/30" />}
      </div>
    ))}
  </div>
);

export function GraphRagArchitecture() {
  const idx = [
    ["Data Sources", "FileText", "#c084fc"],
    ["Document Processing", "Scissors", "#a78bfa"],
    ["Entity Extraction", "Tags", "#22d3ee"],
    ["Relationship Extraction", "Share2", "#38bdf8"],
    ["Graph Construction", "Network", "#34d399"],
    ["Embedding Generation", "Atom", "#fbbf24"],
  ];
  const qry = [
    ["User question", "MessageSquare", "#f472b6"],
    ["Retrieval Engine", "Search", "#fb923c"],
    ["LLM", "Brain", "#f87171"],
    ["Answer + paths", "Eye", "#fde047"],
  ];
  return (
    <div className="glass space-y-3 rounded-2xl p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-violet-300">Indexing pipeline (offline)</div>
      <ArchRow items={idx} />
      <div className="flex flex-col items-center">
        <ArrowDown size={16} className="text-white/30" />
        <div className="rounded-2xl border-2 border-emerald-400/60 bg-emerald-500/10 px-6 py-3 text-center">
          <Icon name="Database" size={22} className="mx-auto text-emerald-300" />
          <div className="text-sm font-bold">Graph Storage</div>
          <div className="text-[11px] text-white/60">Neo4j: nodes · relationships · vector index</div>
        </div>
        <ArrowDown size={16} className="text-white/30" />
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-orange-300">Query pipeline (online)</div>
      <ArchRow items={qry} />
    </div>
  );
}

/* ---------------- 4.7 Microsoft GraphRAG ---------------- */
export function MsGraphRag() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 text-sm font-bold text-amber-300">Indexing workflow</div>
        <div className="space-y-1.5">
          {[
            ["Text units", "Chunk the corpus (~300–1200 tokens)", "FileText"],
            ["Graph extraction", "LLM extracts entities, relationships & claims", "Brain"],
            ["Graph merge", "Merge duplicates, summarise descriptions", "Merge"],
            ["Leiden communities", "Hierarchical clustering: C0 (broad) → C2 (fine)", "Boxes"],
            ["Community reports", "LLM writes a summary report per community", "BookOpen"],
            ["Embeddings", "Embed entities, text units & reports", "Atom"],
          ].map(([a, b, i], k) => (
            <div key={a} className="flex items-center gap-3 rounded-xl bg-white/5 p-2">
              <div className="rounded-lg p-1.5" style={{ background: PALETTE[k] + "33", color: PALETTE[k] }}>
                <Icon name={i} size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold">{a}</div>
                <div className="text-[11px] text-white/55">{b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 text-sm font-bold text-amber-300">Query workflow</div>
        <div className="mb-3 rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-3">
          <div className="text-sm font-bold text-cyan-200">Local search (entity questions)</div>
          <div className="text-[11px] text-white/65">Embed query → nearest entities → gather their neighbours, relationships, text units & community reports → LLM answer.</div>
        </div>
        <div className="rounded-xl border border-pink-400/40 bg-pink-500/10 p-3">
          <div className="mb-2 text-sm font-bold text-pink-200">Global search (map-reduce over communities)</div>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-3 gap-1">
              {["C1", "C2", "C3", "C4", "C5", "C6"].map((c, i) => (
                <div key={c} className="rounded-md py-1 text-center text-[10px] font-bold text-black" style={{ background: PALETTE[i] }}>
                  {c} → ½ ans
                </div>
              ))}
            </div>
            <ArrowRight size={16} className="text-white/40" />
            <div className="rounded-lg bg-pink-400 px-2 py-3 text-center text-[10px] font-bold text-black">
              REDUCE
              <br />
              final
            </div>
          </div>
          <div className="mt-2 text-[11px] text-white/60">MAP: each community report gives a partial answer + helpfulness score. REDUCE: the top-scored partials are combined.</div>
        </div>
        <div className="mt-3 rounded-xl border border-violet-400/40 bg-violet-500/10 p-3 text-[11px] text-white/65">
          <span className="font-bold text-violet-200">DRIFT search</span> combines both: start global, then drill into local follow-ups.
        </div>
      </div>
    </div>
  );
}

export function Communities() {
  const g = useMemo(() => new Graph(ENTERPRISE_KG), []);
  const comm = useMemo(() => g.communities(), [g]);
  const groups = useMemo(() => {
    const m = new Map<number, string[]>();
    comm.forEach((c, id) => m.set(c, [...(m.get(c) ?? []), id]));
    return [...m.entries()].filter(([, v]) => v.length > 2).sort((a, b) => b[1].length - a[1].length);
  }, [comm]);
  const [sel, setSel] = useState<number | null>(null);
  const hl = sel !== null ? { nodes: groups.find(([c]) => c === sel)?.[1] ?? [], edges: [] } : null;
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-2 text-sm font-bold text-amber-300">Communities detected in NovaTech (label propagation, live)</div>
      <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
        <GraphCanvas data={ENTERPRISE_KG} height={400} legend={false} highlight={hl} nodeColor={(n) => PALETTE[(comm.get(n.id) ?? 0) % PALETTE.length]} />
        <div className="max-h-[400px] space-y-2 overflow-y-auto">
          {groups.map(([c, ids]) => {
            const ns = ids.map((id) => g.nodes.get(id)!);
            const by = (l: string) => ns.filter((n) => n.label === l).map((n) => n.name);
            return (
              <button
                key={c}
                onClick={() => setSel(sel === c ? null : c)}
                className={`w-full rounded-xl border p-3 text-left text-[11px] transition ${sel === c ? "border-white/50 bg-white/10" : "border-white/10 hover:bg-white/5"}`}
              >
                <div className="mb-1 flex items-center gap-2 text-xs font-bold">
                  <span className="h-3 w-3 rounded-full" style={{ background: PALETTE[c % PALETTE.length] }} />
                  Community {c} · {ids.length} members
                </div>
                <div className="text-white/65">
                  <b>Report:</b> {by("Project").length ? `Projects ${by("Project").join(", ")}` : "No projects"}
                  {by("Employee").length ? `; people ${by("Employee").slice(0, 4).join(", ")}` : ""}
                  {by("Technology").length ? `; tech ${by("Technology").slice(0, 4).join(", ")}` : ""}.
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 5.1 Dev architecture ---------------- */
export function DevArchitecture() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1.3fr_auto_1fr]">
        <div className="space-y-2">
          <Box c="#c084fc">
            <Icon name="MonitorSmartphone" size={18} className="mx-auto mb-1 text-violet-300" />
            UI: Next.js / Streamlit
          </Box>
          <Box c="#a78bfa">BYOK key in browser</Box>
        </div>
        <ArrowRight className="mx-auto rotate-90 text-white/30 md:rotate-0" />
        <div className="rounded-2xl border-2 border-dashed border-fuchsia-400/50 p-3">
          <div className="mb-2 text-center text-xs font-bold text-fuchsia-300">API: FastAPI / Next.js route</div>
          <div className="space-y-2">
            <Box c="#f472b6">
              <Icon name="Workflow" size={16} className="mx-auto mb-1 text-pink-300" />
              LangGraph agent (StateGraph)
            </Box>
            <div className="grid grid-cols-2 gap-2">
              <Box c="#fb923c">Ingestion pipeline</Box>
              <Box c="#fbbf24">Retrievers</Box>
            </div>
          </div>
        </div>
        <ArrowRight className="mx-auto rotate-90 text-white/30 md:rotate-0" />
        <div className="space-y-2">
          <Box c="#34d399">
            <Icon name="Database" size={16} className="mx-auto mb-1 text-emerald-300" />
            Neo4j: graph + vector index
          </Box>
          <Box c="#22d3ee">
            <Icon name="Zap" size={16} className="mx-auto mb-1 text-cyan-300" />
            Groq LLM API
          </Box>
          <Box c="#818cf8">Embedding model</Box>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 5.3 Extraction demo ---------------- */
const SENT = [
  ["John", "Person"],
  [" works at ", ""],
  ["Microsoft", "Organization"],
  [" as an ", ""],
  ["AI Engineer", "Role"],
  [". ", ""],
  ["He", "Person"],
  [" uses ", ""],
  ["Python", "Technology"],
  [" and ", ""],
  ["LangChain", "Technology"],
  [" to develop ", ""],
  ["intelligent applications", "Concept"],
  [".", ""],
];
const TRIPLES: [string, string, string, string, string][] = [
  ["John", "Person", "WORKS_AT", "Microsoft", "Organization"],
  ["John", "Person", "HAS_ROLE", "AI Engineer", "Role"],
  ["John", "Person", "USES", "Python", "Technology"],
  ["John", "Person", "USES", "LangChain", "Technology"],
  ["John", "Person", "DEVELOPS", "Intelligent Applications", "Concept"],
];
export function triplesToGraph(triples: { subject: string; subject_type: string; relation: string; object: string; object_type: string }[]): GraphData {
  const nodes = new Map<string, GraphData["nodes"][number]>();
  const edges: KGEdge[] = [];
  triples.forEach((t, i) => {
    const a = slugify(t.subject);
    const b = slugify(t.object);
    if (!nodes.has(a)) nodes.set(a, { id: a, label: t.subject_type, name: t.subject, props: { name: t.subject } });
    if (!nodes.has(b)) nodes.set(b, { id: b, label: t.object_type, name: t.object, props: { name: t.object } });
    edges.push({ id: "t" + i, source: a, target: b, type: t.relation });
  });
  return { nodes: [...nodes.values()], edges };
}
export function ExtractionDemo() {
  const [stage, setStage] = useState(0);
  const colors: Record<string, string> = { Person: "#a78bfa", Organization: "#f472b6", Role: "#fb923c", Technology: "#34d399", Concept: "#fbbf24" };
  const graph = useMemo(() => triplesToGraph(TRIPLES.map(([s, st, r, o, ot]) => ({ subject: s, subject_type: st, relation: r, object: o, object_type: ot }))), []);
  const stages = ["Raw text", "Entities", "Triples", "Graph"];
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {stages.map((s, i) => (
          <button
            key={s}
            onClick={() => setStage(i)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${i <= stage ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white" : "bg-white/5 text-white/50"}`}
          >
            {i + 1}. {s}
          </button>
        ))}
        <button onClick={() => setStage((s) => (s + 1) % 4)} className="ml-auto flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1 text-xs hover:bg-white/10">
          <Play size={12} /> {stage === 3 ? "Restart" : "Next stage"}
        </button>
      </div>
      <p className="rounded-xl bg-black/30 p-4 text-lg leading-loose">
        {SENT.map(([t, ty], i) =>
          ty && stage >= 1 ? (
            <span key={i} className="fade-up mx-0.5 rounded-md px-1.5 py-0.5" style={{ background: colors[ty] + "33", borderBottom: `2px solid ${colors[ty]}` }}>
              {t}
              <sub className="ml-1 text-[9px] font-bold" style={{ color: colors[ty] }}>
                {ty}
              </sub>
            </span>
          ) : (
            <span key={i}>{t}</span>
          ),
        )}
      </p>
      {stage >= 1 && (
        <p className="mt-2 text-xs text-white/55">
          Note the coreference: <b>He</b> → <b>John</b>. LLMs resolve pronouns far better than classic NER.
        </p>
      )}
      {stage >= 2 && (
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {TRIPLES.map(([s, st, r, o, ot], i) => (
            <div key={i} className="fade-up flex items-center gap-1.5 rounded-lg bg-black/30 px-2 py-1.5 font-mono text-[11px]" style={{ animationDelay: `${i * 80}ms` }}>
              <span style={{ color: colors[st] }}>{s}</span>
              <span className="text-white/40">─</span>
              <span className="text-cyan-300">{r}</span>
              <span className="text-white/40">→</span>
              <span style={{ color: colors[ot] }}>{o}</span>
            </div>
          ))}
        </div>
      )}
      {stage >= 3 && (
        <div className="mt-3">
          <GraphCanvas data={graph} height={300} showEdgeLabels="always" />
        </div>
      )}
      <div className="mt-3 text-right">
        <Link href="/labs/3" className="text-xs text-pink-300 hover:underline">
          Try it on your own text with Groq in Lab 3 →
        </Link>
      </div>
    </div>
  );
}

/* ---------------- 5.4 Dedupe ---------------- */
export function Dedupe() {
  const before: [string, string, string, string, string][] = [
    ["John Miller", "Person", "WORKS_AT", "Microsoft", "Organization"],
    ["J. Miller", "Person", "USES", "Python", "Technology"],
    ["john miller", "Person", "USES", "LangChain", "Technology"],
    ["Sara Lee", "Person", "WORKS_AT", "MSFT", "Organization"],
    ["Sara Lee", "Person", "WORKS_AT", "Microsoft Corp.", "Organization"],
    ["Sara Lee", "Person", "USES", "python", "Technology"],
  ];
  const canon: Record<string, string> = { "J. Miller": "John Miller", "john miller": "John Miller", MSFT: "Microsoft", "Microsoft Corp.": "Microsoft", python: "Python" };
  const [merged, setMerged] = useState(false);
  const triples = before.map(([s, st, r, o, ot]) => ({ subject: merged ? canon[s] ?? s : s, subject_type: st, relation: r, object: merged ? canon[o] ?? o : o, object_type: ot }));
  const data = triplesToGraph(triples);
  const ded = new Map<string, KGEdge>();
  data.edges.forEach((e) => ded.set(e.source + e.type + e.target, e));
  const final = { nodes: data.nodes, edges: [...ded.values()] };
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <b>{final.nodes.length}</b> nodes · <b>{final.edges.length}</b> relationships{" "}
          <span className={merged ? "text-emerald-300" : "text-rose-300"}>{merged ? "(resolved ✓)" : "(duplicates!)"}</span>
        </div>
        <button onClick={() => setMerged((m) => !m)} className="rounded-lg bg-gradient-to-r from-amber-400 to-pink-500 px-3 py-1.5 text-sm font-semibold text-black">
          {merged ? "Show raw extraction" : "Run entity resolution"}
        </button>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <GraphCanvas data={final} height={300} showEdgeLabels="always" />
        <div className="space-y-1.5 text-xs">
          <div className="font-semibold text-amber-300">Resolution rules</div>
          {Object.entries(canon).map(([a, b]) => (
            <div key={a} className={`rounded-lg px-2 py-1 font-mono ${merged ? "bg-emerald-500/10" : "bg-white/5"}`}>
              &quot;{a}&quot; → &quot;{b}&quot;
            </div>
          ))}
          <p className="pt-1 text-white/50">Techniques: case/punctuation normalisation, alias tables, fuzzy string match, embedding similarity, LLM adjudication.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 5.5 Hybrid retrieval ---------------- */
export function HybridRetrieval() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid items-center gap-3 md:grid-cols-[auto_auto_1fr_auto_auto_auto_auto]">
        <Box c="#c084fc">Question</Box>
        <ArrowRight className="mx-auto rotate-90 text-white/30 md:rotate-0" size={16} />
        <div className="space-y-2">
          <Box c="#22d3ee">
            <b>Vector index</b>
            <br />
            top-k similar nodes / chunks
          </Box>
          <Box c="#f472b6">
            <b>Entity linking</b>
            <br />
            names → exact nodes
          </Box>
          <Box c="#34d399">
            <b>Text2Cypher</b>
            <br />
            LLM-written query
          </Box>
        </div>
        <ArrowRight className="mx-auto rotate-90 text-white/30 md:rotate-0" size={16} />
        <Box c="#fbbf24">
          <b>Fuse (RRF)</b>
          <br />
          <span className="font-mono text-[10px]">Σ 1/(60 + rank)</span>
          <br />+ k-hop expand
        </Box>
        <ArrowRight className="mx-auto rotate-90 text-white/30 md:rotate-0" size={16} />
        <Box c="#fb923c">
          <b>Context</b>
          <br />
          triples + text → LLM
        </Box>
      </div>
    </div>
  );
}

/* ---------------- 5.7 Sample questions ---------------- */
export const SAMPLE_QUESTIONS = [
  "Which employees have experience in Python and Agentic AI?",
  "Which projects use LangChain and Neo4j?",
  "Who is working on projects related to Generative AI?",
  "Which technologies are commonly used across multiple projects?",
  "Find the connection between John Miller, the Knowledge Graph Assistant project and Neo4j.",
];
export function SampleQuestions() {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {SAMPLE_QUESTIONS.map((q, i) => (
        <Link
          key={q}
          href={`/labs/6?q=${encodeURIComponent(q)}`}
          className="glass group flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-pink-400/50"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black" style={{ background: PALETTE[i] }}>
            {i + 1}
          </span>
          <span className="text-sm">{q}</span>
          <MessageSquare size={16} className="ml-auto shrink-0 text-white/30 group-hover:text-pink-300" />
        </Link>
      ))}
      <div className="glass flex items-center gap-3 rounded-2xl p-4 text-sm text-white/65">
        <Bot className="text-pink-300" /> Expected output: relevant answers, connected entities, graph paths, source-grounded responses.
      </div>
    </div>
  );
}

/* ---------------- 6.1 Query decomposition (live) ---------------- */
export function QueryDecomposition() {
  const g = useMemo(() => new Graph(ENTERPRISE_KG), []);
  const subs = useMemo(() => {
    // each sub-question feeds the next: results are chained, not hard-coded
    const q1 = `MATCH (p:Project)-[:USES]->(t:Technology) RETURN t.name AS tech, count(p) AS n ORDER BY n DESC LIMIT 1`;
    const tech = String(runCypher(g, q1).rows[0]?.[0] ?? "Neo4j");
    const q2 = `MATCH (p:Project)-[:USES]->(:Technology {name:"${tech}"}) RETURN collect(p.name) AS projects`;
    const q3 = `MATCH (e:Employee)-[:WORKS_ON]->(p:Project)-[:USES]->(:Technology {name:"${tech}"}), (e)-[k:KNOWS]->(:Skill {name:"Python"}) WHERE k.level = "Expert" OR k.level = "Advanced" RETURN DISTINCT e.name AS expert, k.level AS level`;
    const experts = runCypher(g, q3).rows.map((r) => `"${String(r[0])}"`);
    const q4 = `MATCH (m:Employee)-[:MANAGES]->(e:Employee) WHERE e.name IN [${experts.join(", ")}] RETURN e.name AS expert, m.name AS manager`;
    return [
      { q: "What is the most widely used technology?", cy: q1 },
      { q: `Which projects use ${tech}?`, cy: q2 },
      { q: "Which strong Python developers work on those projects?", cy: q3 },
      { q: "Who manages them?", cy: q4 },
    ];
  }, [g]);
  const [n, setN] = useState(0);
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-1 text-xs uppercase tracking-wider text-indigo-300">Complex question</div>
      <div className="mb-3 font-semibold">“Which strong Python developers work on projects using our most popular technology, and who manages them?”</div>
      <div className="space-y-2">
        {subs.map((s, i) => {
          const r = i < n ? runCypher(g, s.cy) : null;
          return (
            <div key={i} className={`rounded-xl border p-3 transition ${i < n ? "border-indigo-400/50 bg-indigo-500/10" : "border-white/10 opacity-60"}`}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-400 text-xs text-black">{i + 1}</span>
                {s.q}
              </div>
              {r && (
                <div className="fade-up mt-2 space-y-1">
                  <code className="block overflow-x-auto rounded bg-black/40 p-1.5 font-mono text-[10.5px] text-cyan-200">{s.cy}</code>
                  <div className="text-xs text-emerald-200">→ {r.rows.map((row) => row.map((c) => (Array.isArray(c) ? c.join(", ") : String(c))).join(" · ")).join(" | ")}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => setN((x) => (x >= subs.length ? 0 : x + 1))}
          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-400 px-3 py-1.5 text-sm font-semibold"
        >
          <Play size={13} /> {n >= subs.length ? "Reset" : `Run sub-question ${n + 1}`}
        </button>
      </div>
    </div>
  );
}

/* ---------------- 6.2 LangGraph agent loop ---------------- */
export function AgentLoop() {
  return (
    <div className="glass grid gap-4 rounded-2xl p-4 lg:grid-cols-[1.3fr_1fr]">
      <svg viewBox="0 0 460 300" className="w-full">
        <defs>
          <marker id="al" viewBox="0 -5 10 10" refX="10" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,-5L10,0L0,5" fill="#c4b5fd" />
          </marker>
        </defs>
        {[
          ["START", 60, 40, "#94a3b8", 70],
          ["link_entities", 230, 40, "#f472b6", 120],
          ["agent (LLM)", 230, 150, "#c084fc", 120],
          ["tools", 400, 150, "#34d399", 80],
          ["END", 230, 260, "#94a3b8", 70],
        ].map(([t, x, y, c, w]) => (
          <g key={t as string}>
            <rect x={(x as number) - (w as number) / 2} y={(y as number) - 20} width={w as number} height={40} rx={20} fill={(c as string) + "33"} stroke={c as string} strokeWidth={2} />
            <text x={x as number} y={(y as number) + 5} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff" className="font-mono">
              {t}
            </text>
          </g>
        ))}
        <line x1={95} y1={40} x2={168} y2={40} stroke="#c4b5fd" strokeWidth={2} markerEnd="url(#al)" className="dash-move" />
        <line x1={230} y1={60} x2={230} y2={128} stroke="#c4b5fd" strokeWidth={2} markerEnd="url(#al)" className="dash-move" />
        <path d="M 290 140 C 330 110, 350 110, 370 130" fill="none" stroke="#34d399" strokeWidth={2} markerEnd="url(#al)" className="dash-move" />
        <path d="M 370 172 C 350 195, 330 195, 290 162" fill="none" stroke="#34d399" strokeWidth={2} markerEnd="url(#al)" className="dash-move" />
        <line x1={230} y1={170} x2={230} y2={238} stroke="#c4b5fd" strokeWidth={2} markerEnd="url(#al)" strokeDasharray="5 4" />
        <text x={335} y={102} textAnchor="middle" fontSize={10} fill="#6ee7b7">
          has tool_calls
        </text>
        <text x={335} y={210} textAnchor="middle" fontSize={10} fill="#6ee7b7">
          observations
        </text>
        <text x={240} y={210} fontSize={10} fill="#c4b5fd">
          no tool_calls → answer
        </text>
        <rect x={10} y={110} width={130} height={110} rx={12} fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.15)" />
        <text x={75} y={130} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fde68a">
          State
        </text>
        {["messages[]", "linked entities", "tool results", "checkpoint"].map((s, i) => (
          <text key={s} x={22} y={152 + i * 17} fontSize={10} fill="#e9d5ff" className="font-mono">
            • {s}
          </text>
        ))}
      </svg>
      <div className="space-y-2 text-sm">
        <h4 className="font-bold text-indigo-300">ReAct loop as a state machine</h4>
        {[
          ["Reason", "LLM reads state and decides: answer, or call a tool?"],
          ["Act", "ToolNode runs search_entities / run_cypher / find_paths"],
          ["Observe", "Results are appended to messages as ToolMessages"],
          ["Repeat", "Conditional edge loops until no more tool calls"],
        ].map(([a, b], i) => (
          <div key={a} className="flex gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black" style={{ background: PALETTE[i] }}>
              {i + 1}
            </span>
            <div>
              <b>{a}:</b> <span className="text-white/65">{b}</span>
            </div>
          </div>
        ))}
        <Link href="/assistant" className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-300 hover:underline">
          See this exact graph run live in the AI Assistant →
        </Link>
      </div>
    </div>
  );
}

/* ---------------- 6.4 Use cases ---------------- */
export function UseCases() {
  const items = [
    ["Enterprise knowledge mgmt", "Building2", "(Doc)-[:MENTIONS]->(Concept)<-[:EXPERT_IN]-(Person)"],
    ["Financial fraud detection", "DollarSign", "(Acct)-[:SHARES_DEVICE]->(Acct)-[:SENT]->(Mule)"],
    ["Healthcare discovery", "HeartPulse", "(Drug)-[:TARGETS]->(Protein)-[:ASSOCIATED]->(Disease)"],
    ["Customer intelligence", "Users", "(Customer)-[:BOUGHT]->(Product)<-[:BOUGHT]-(Similar)"],
    ["IT incident management", "Activity", "(Incident)-[:AFFECTS]->(Service)-[:DEPENDS_ON]->(DB)"],
    ["Software dependencies", "Package", "(App)-[:IMPORTS*]->(Lib)-[:HAS_CVE]->(Vuln)"],
    ["Legal intelligence", "Scale", "(Contract)-[:CITES]->(Clause)-[:GOVERNED_BY]->(Law)"],
    ["Supply chain", "Truck", "(Part)-[:SUPPLIED_BY]->(Vendor)-[:LOCATED_IN]->(Region)"],
    ["Cyber threat intel", "ShieldAlert", "(Actor)-[:USES]->(TTP)-[:EXPLOITS]->(CVE)"],
    ["Intelligent search", "Search", "(Query)→(Entity)→neighbours→ranked answers"],
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {items.map(([t, i, p], k) => (
        <div key={t} className="glass group rounded-2xl p-3 transition hover:-translate-y-1">
          <div className="mb-2 inline-flex rounded-xl p-2" style={{ background: PALETTE[k % PALETTE.length] + "26", color: PALETTE[k % PALETTE.length] }}>
            <Icon name={i} size={18} />
          </div>
          <div className="text-sm font-semibold">{t}</div>
          <code className="mt-1 block font-mono text-[9.5px] leading-snug text-white/50 group-hover:text-cyan-200">{p}</code>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 6.5 Challenges ---------------- */
export function Challenges() {
  const rows: [string, number, string][] = [
    ["Entity resolution & duplicate nodes", 9, "Canonical IDs, alias tables, uniqueness constraints, embedding + LLM matching"],
    ["Graph construction accuracy", 8, "Constrained schema, few-shot prompts, validation node, human review sampling"],
    ["LLM hallucinations", 8, "Answer only from retrieved context, cite paths, refuse when empty"],
    ["Retrieval latency & cost", 7, "Cache, limit hops, pre-compute summaries, small models for routing"],
    ["Data freshness & sync", 7, "CDC/event streams, incremental indexing, valid-from/to timestamps"],
    ["Access control & security", 8, "Row/label-level security, filter by user in Cypher, read-only DB user for agents"],
    ["Scalability", 6, "Sharding/Fabric, GDS projections, limit fan-out of super-nodes"],
    ["Graph governance", 6, "Ontology ownership, schema versioning, lineage via source properties"],
    ["Evaluation", 7, "Golden Q&A sets, faithfulness & context-recall metrics (RAGAS), path correctness"],
  ];
  return (
    <div className="glass overflow-x-auto rounded-2xl p-4">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-white/50">
            <th className="pb-2">Challenge</th>
            <th className="pb-2">Impact</th>
            <th className="pb-2">Best practice</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([c, s, m]) => (
            <tr key={c} className="border-t border-white/5">
              <td className="py-2 pr-3 font-semibold">{c}</td>
              <td className="w-36 py-2 pr-3">
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full" style={{ width: `${s * 10}%`, background: `linear-gradient(90deg, #fbbf24, ${s >= 8 ? "#f43f5e" : "#fb923c"})` }} />
                </div>
              </td>
              <td className="py-2 text-white/70">{m}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const CUSTOM_B: Record<string, () => React.ReactElement> = {
  "embedding-space": EmbeddingSpace,
  "rag-limitations": RagLimitations,
  "graphrag-concept": GraphRagConcept,
  "graphrag-architecture": GraphRagArchitecture,
  "ms-graphrag": MsGraphRag,
  communities: Communities,
  "dev-architecture": DevArchitecture,
  "extraction-demo": ExtractionDemo,
  dedupe: Dedupe,
  "hybrid-retrieval": HybridRetrieval,
  "sample-questions": SampleQuestions,
  "query-decomposition": QueryDecomposition,
  "agent-loop": AgentLoop,
  "use-cases": UseCases,
  challenges: Challenges,
};
