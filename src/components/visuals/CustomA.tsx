"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import GraphCanvas from "../GraphCanvas";
import KGExplorer from "../KGExplorer";
import CypherPlayground from "../CypherPlayground";
import { Graph } from "@/lib/kg/graph";
import { ENTERPRISE_DOCS, ENTERPRISE_KG } from "@/lib/kg/data";
import { runCypher } from "@/lib/kg/cypher";
import { colorFor, GraphData, KGEdge } from "@/lib/kg/types";
import { PALETTE } from "./Primitives";

const Panel = ({ title, children, accent = "#c084fc" }: { title: string; children: React.ReactNode; accent?: string }) => (
  <div className="glass rounded-2xl p-4">
    <h4 className="mb-3 text-sm font-bold" style={{ color: accent }}>
      {title}
    </h4>
    {children}
  </div>
);

/* ---------------- 1.1 RDBMS vs Graph ---------------- */
const MiniTable = ({ name, cols, rows, c }: { name: string; cols: string[]; rows: string[][]; c: string }) => (
  <div className="overflow-hidden rounded-lg border text-[10.5px]" style={{ borderColor: c + "66" }}>
    <div className="px-2 py-1 font-bold" style={{ background: c + "33", color: c }}>
      {name}
    </div>
    <table className="w-full">
      <thead>
        <tr>
          {cols.map((x) => (
            <th key={x} className="px-2 py-0.5 text-left font-mono text-white/60">
              {x}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-white/5">
            {r.map((x, j) => (
              <td key={j} className="px-2 py-0.5 font-mono">
                {x}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export function RdbmsVsGraph() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Panel title="Relational: relationships computed with JOINs" accent="#22d3ee">
        <div className="flex items-start gap-2">
          <MiniTable name="employees" cols={["id", "name"]} rows={[["1", "John"], ["2", "Priya"]]} c="#22d3ee" />
          <div className="mt-8 text-white/30">⋈</div>
          <MiniTable name="emp_project" cols={["emp_id", "proj_id"]} rows={[["1", "10"], ["2", "10"], ["1", "11"]]} c="#fbbf24" />
          <div className="mt-8 text-white/30">⋈</div>
          <MiniTable name="projects" cols={["id", "name"]} rows={[["10", "KG Asst"], ["11", "Copilot"]]} c="#f472b6" />
        </div>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-2 font-mono text-[10.5px] text-cyan-100">{`SELECT e.name, p.name FROM employees e
JOIN emp_project ep ON ep.emp_id = e.id
JOIN projects p ON p.id = ep.proj_id;`}</pre>
        <p className="mt-2 text-xs text-white/55">Each extra hop adds another JOIN, and cost grows with table size.</p>
      </Panel>
      <Panel title="Graph: relationships stored as first-class edges" accent="#f472b6">
        <svg viewBox="0 0 320 140" className="w-full">
          {[
            [60, 40, "John", "#a78bfa"],
            [60, 110, "Priya", "#a78bfa"],
            [250, 40, "KG Asst", "#22d3ee"],
            [250, 110, "Copilot", "#22d3ee"],
          ].map(([x, y, t, c]) => (
            <g key={t as string}>
              <circle cx={x as number} cy={y as number} r={20} fill={c as string} opacity={0.9} />
              <text x={x as number} y={(y as number) + 4} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#0b0820">
                {t}
              </text>
            </g>
          ))}
          {[
            [80, 40, 228, 40],
            [80, 105, 230, 48],
            [80, 45, 230, 105],
          ].map(([a, b, c, d], i) => (
            <g key={i}>
              <line x1={a} y1={b} x2={c} y2={d} stroke="#fde047" strokeWidth={2} className="dash-move" />
            </g>
          ))}
          <text x={155} y={32} textAnchor="middle" fontSize={8.5} fill="#fef08a" className="font-mono">
            WORKS_ON
          </text>
        </svg>
        <pre className="mt-1 overflow-x-auto rounded-lg bg-black/40 p-2 font-mono text-[10.5px] text-pink-100">{`MATCH (e:Employee)-[:WORKS_ON]->(p:Project)
RETURN e.name, p.name`}</pre>
        <p className="mt-2 text-xs text-white/55">Index-free adjacency: each hop is a pointer chase, so cost depends on the neighbourhood, not the table size.</p>
      </Panel>
    </div>
  );
}

/* ---------------- 1.2 Triple anatomy ---------------- */
export function TripleAnatomy() {
  return (
    <div className="glass rounded-2xl p-5">
      <svg viewBox="0 0 640 230" className="w-full">
        <defs>
          <linearGradient id="tg1" x1="0" x2="1">
            <stop offset="0" stopColor="#c084fc" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <marker id="tarrow" viewBox="0 -5 10 10" refX="9" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0,-5L10,0L0,5" fill="#22d3ee" />
          </marker>
        </defs>
        <circle cx={120} cy={95} r={52} fill="#a78bfa" opacity={0.25} className="pulse-ring" />
        <circle cx={120} cy={95} r={44} fill="#a78bfa" />
        <text x={120} y={100} textAnchor="middle" fontSize={18} fontWeight={800} fill="#1e1b4b">
          John
        </text>
        <rect x={84} y={30} width={72} height={18} rx={9} fill="#1e1b4b" stroke="#a78bfa" />
        <text x={120} y={43} textAnchor="middle" fontSize={10} fill="#ddd6fe" className="font-mono">
          :Person
        </text>
        <circle cx={520} cy={95} r={44} fill="#f472b6" />
        <text x={520} y={100} textAnchor="middle" fontSize={18} fontWeight={800} fill="#500724">
          IBM
        </text>
        <rect x={478} y={30} width={84} height={18} rx={9} fill="#500724" stroke="#f472b6" />
        <text x={520} y={43} textAnchor="middle" fontSize={10} fill="#fbcfe8" className="font-mono">
          :Company
        </text>
        <line x1={166} y1={95} x2={472} y2={95} stroke="url(#tg1)" strokeWidth={4} markerEnd="url(#tarrow)" className="dash-move" />
        <rect x={250} y={74} width={140} height={24} rx={12} fill="#0b0820" stroke="#22d3ee" />
        <text x={320} y={90} textAnchor="middle" fontSize={12} fontWeight={700} fill="#67e8f9" className="font-mono">
          :WORKS_FOR
        </text>
        <rect x={262} y={104} width={116} height={20} rx={6} fill="#0b0820" stroke="#fbbf24" strokeDasharray="3 3" />
        <text x={320} y={118} textAnchor="middle" fontSize={10} fill="#fde68a" className="font-mono">
          {"{since: 2021}"}
        </text>
        <rect x={50} y={150} width={140} height={22} rx={6} fill="#0b0820" stroke="#fbbf24" strokeDasharray="3 3" />
        <text x={120} y={165} textAnchor="middle" fontSize={10} fill="#fde68a" className="font-mono">
          {"{role: 'AI Engineer'}"}
        </text>
        {[
          [120, "SUBJECT", "entity · node", "#c084fc"],
          [320, "PREDICATE", "relationship · edge", "#22d3ee"],
          [520, "OBJECT", "entity · node", "#f472b6"],
        ].map(([x, a, b, c]) => (
          <g key={a as string}>
            <text x={x as number} y={200} textAnchor="middle" fontSize={13} fontWeight={800} fill={c as string} letterSpacing={2}>
              {a}
            </text>
            <text x={x as number} y={217} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.55)">
              {b}
            </text>
          </g>
        ))}
        <text x={608} y={170} textAnchor="end" fontSize={10} fill="#fde68a">
          dashed = properties
        </text>
      </svg>
    </div>
  );
}

/* ---------------- 1.2 Mini KG ---------------- */
const MINI: GraphData = (() => {
  const n = (id: string, label: string, props: Record<string, string> = {}) => ({ id, label, name: id, props: { name: id, ...props } });
  const nodes = [
    n("John", "Person", { role: "AI Engineer" }),
    n("IBM", "Organization", { hq: "Armonk, NY" }),
    n("Priya", "Person", { role: "Head of AI" }),
    n("Python", "Technology"),
    n("LangChain", "Technology"),
    n("Neo4j", "Technology"),
    n("Watson Assistant", "Product"),
    n("New York", "Location"),
    n("Graph RAG", "Concept"),
  ];
  const e = (s: string, t: string, type: string, i: number): KGEdge => ({ id: "m" + i, source: s, target: t, type });
  const edges = [
    ["John", "IBM", "WORKS_FOR"], ["Priya", "IBM", "WORKS_FOR"], ["Priya", "John", "MANAGES"], ["John", "Python", "USES"],
    ["John", "LangChain", "USES"], ["IBM", "Watson Assistant", "BUILDS"], ["IBM", "New York", "HEADQUARTERED_IN"],
    ["Watson Assistant", "Graph RAG", "APPLIES"], ["Graph RAG", "Neo4j", "IMPLEMENTED_WITH"], ["John", "Graph RAG", "RESEARCHES"],
  ].map(([s, t, ty], i) => e(s, t, ty, i));
  return { nodes, edges };
})();

export function MiniKG() {
  return <GraphCanvas data={MINI} height={340} showEdgeLabels="always" />;
}

/* ---------------- 1.3 Representations ---------------- */
export function Representations() {
  const N = ["John", "IBM", "Python", "Priya"];
  const E: [number, number, string][] = [
    [0, 1, "WORKS_FOR"],
    [0, 2, "USES"],
    [3, 0, "MANAGES"],
    [3, 1, "WORKS_FOR"],
  ];
  const pos = [
    [70, 70],
    [210, 40],
    [210, 120],
    [70, 150],
  ];
  const c = ["#a78bfa", "#f472b6", "#34d399", "#a78bfa"];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Panel title="① Visual diagram" accent="#c084fc">
        <svg viewBox="0 0 280 180" className="w-full">
          {E.map(([a, b, t], i) => (
            <g key={i}>
              <line x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
              <text x={(pos[a][0] + pos[b][0]) / 2} y={(pos[a][1] + pos[b][1]) / 2 - 3} fontSize={7.5} fill="#ddd6fe" textAnchor="middle" className="font-mono">
                {t}
              </text>
            </g>
          ))}
          {N.map((n, i) => (
            <g key={n}>
              <circle cx={pos[i][0]} cy={pos[i][1]} r={18} fill={c[i]} />
              <text x={pos[i][0]} y={pos[i][1] + 3.5} fontSize={9} fontWeight={700} textAnchor="middle" fill="#0b0820">
                {n}
              </text>
            </g>
          ))}
        </svg>
      </Panel>
      <Panel title="② Triples (RDF-style)" accent="#22d3ee">
        <div className="space-y-1.5 font-mono text-[11px]">
          {E.map(([a, b, t], i) => (
            <div key={i} className="rounded-md bg-black/30 px-2 py-1">
              <span className="text-violet-300">{N[a]}</span> <span className="text-cyan-300">{t}</span> <span className="text-pink-300">{N[b]}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="③ Adjacency list" accent="#fbbf24">
        <div className="space-y-1.5 font-mono text-[11px]">
          {N.map((n, i) => (
            <div key={n} className="rounded-md bg-black/30 px-2 py-1">
              <span className="text-amber-300">{n}</span> → [{E.filter(([a]) => a === i).map(([, b]) => N[b]).join(", ")}]
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="④ Adjacency matrix" accent="#34d399">
        <table className="w-full text-center font-mono text-[10.5px]">
          <thead>
            <tr>
              <th />
              {N.map((n) => (
                <th key={n} className="pb-1 text-emerald-300">
                  {n.slice(0, 4)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {N.map((n, i) => (
              <tr key={n}>
                <td className="pr-1 text-right text-emerald-300">{n.slice(0, 4)}</td>
                {N.map((_, j) => {
                  const v = E.some(([a, b]) => a === i && b === j) ? 1 : 0;
                  return (
                    <td key={j} className={`m-0.5 rounded ${v ? "bg-emerald-400/70 font-bold text-black" : "text-white/30"}`}>
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[10px] text-white/45">Mostly zeros: real KGs are sparse.</p>
      </Panel>
    </div>
  );
}

/* ---------------- 1.4 Multi-hop demo ---------------- */
export function MultiHopDemo() {
  const g = useMemo(() => new Graph(ENTERPRISE_KG), []);
  const hops = useMemo(() => {
    const steps: { label: string; cypher: string; nodes: string[]; edges: string[]; found: string }[] = [];
    const john = "john-miller";
    const mgr = g.neighbors(john, "MANAGES", "in");
    const team = g.neighbors(mgr[0].node.id, "MANAGES", "out");
    const teamIds = [mgr[0].node.id, ...team.map((t) => t.node.id)];
    const proj = teamIds.flatMap((id) => g.neighbors(id, "WORKS_ON", "out"));
    const projIds = [...new Set(proj.map((p) => p.node.id))];
    const tech = projIds.flatMap((id) => g.neighbors(id, "USES", "out"));
    const n0 = [john];
    const n1 = [...n0, mgr[0].node.id];
    const e1 = mgr.map((m) => m.edge.id);
    const n2 = [...new Set([...n1, ...team.map((t) => t.node.id)])];
    const e2 = [...e1, ...team.map((t) => t.edge.id)];
    const n3 = [...new Set([...n2, ...projIds])];
    const e3 = [...e2, ...proj.map((p) => p.edge.id)];
    const n4 = [...new Set([...n3, ...tech.map((t) => t.node.id)])];
    const e4 = [...e3, ...tech.map((t) => t.edge.id)];
    steps.push({ label: "Start: John Miller", cypher: `MATCH (j:Employee {name:"John Miller"})`, nodes: n0, edges: [], found: "John Miller" });
    steps.push({ label: "Hop 1: who manages John?", cypher: `<-[:MANAGES]-(m)`, nodes: n1, edges: e1, found: mgr[0].node.name });
    steps.push({ label: "Hop 2: the manager's team", cypher: `-[:MANAGES]->(t)`, nodes: n2, edges: e2, found: team.map((t) => t.node.name).join(", ") });
    steps.push({ label: "Hop 3: their projects", cypher: `-[:WORKS_ON]->(p)`, nodes: n3, edges: e3, found: projIds.map((id) => g.nodes.get(id)!.name).join(", ") });
    steps.push({ label: "Hop 4: technologies used", cypher: `-[:USES]->(tech) RETURN DISTINCT tech.name`, nodes: n4, edges: e4, found: [...new Set(tech.map((t) => t.node.name))].join(", ") });
    return steps;
  }, [g]);
  const [i, setI] = useState(0);
  const s = hops[i];
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-fuchsia-300">Interactive multi-hop question</div>
          <div className="font-semibold">“Which technologies does John&apos;s manager&apos;s team use?”</div>
          <div className="text-xs text-white/50">No single document states this. It takes 4 hops across HR and project data.</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setI(0)} className="rounded-lg border border-white/15 p-2 hover:bg-white/10" aria-label="Restart">
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setI((x) => Math.min(hops.length - 1, x + 1))}
            disabled={i === hops.length - 1}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 px-3 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Next hop <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="mb-3 flex gap-1">
        {hops.map((h, j) => (
          <button key={j} onClick={() => setI(j)} className={`h-1.5 flex-1 rounded-full transition ${j <= i ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400" : "bg-white/10"}`} aria-label={h.label} />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
        <GraphCanvas data={ENTERPRISE_KG} height={380} highlight={{ nodes: s.nodes, edges: s.edges }} legend={false} />
        <div className="space-y-2">
          {hops.slice(0, i + 1).map((h, j) => (
            <div key={j} className={`fade-up rounded-xl border p-3 ${j === i ? "border-fuchsia-400/60 bg-fuchsia-500/10" : "border-white/10 bg-white/5"}`}>
              <div className="text-xs font-semibold">{h.label}</div>
              <code className="block font-mono text-[10.5px] text-cyan-300">{h.cypher}</code>
              <div className="mt-1 text-[11px] text-white/70">→ {h.found}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 1.5 RAG vs Graph RAG flow ---------------- */
const Lane = ({ title, steps, c1, c2, out }: { title: string; steps: string[]; c1: string; c2: string; out: string }) => (
  <div className="glass rounded-2xl p-4">
    <div className="mb-3 text-sm font-bold" style={{ color: c1 }}>
      {title}
    </div>
    <div className="relative flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className="rounded-xl border px-3 py-2 text-xs font-medium" style={{ borderColor: c1 + "66", background: `linear-gradient(135deg, ${c1}22, ${c2}11)` }}>
            {s}
          </div>
          {i < steps.length - 1 && <ArrowRight size={14} style={{ color: c2 }} />}
        </div>
      ))}
    </div>
    <div className="mt-3 rounded-lg bg-black/30 p-2 text-xs text-white/70">
      <span className="font-semibold" style={{ color: c2 }}>
        Output:
      </span>{" "}
      {out}
    </div>
  </div>
);

export function RagVsGraphRagFlow() {
  return (
    <div className="grid gap-3">
      <Lane
        title="Traditional RAG: similarity over text chunks"
        steps={["Question", "Embed query", "Vector search", "Top-k chunks", "LLM", "Answer"]}
        c1="#22d3ee"
        c2="#38bdf8"
        out="Fluent answer citing a few passages. May miss facts spread across documents."
      />
      <Lane
        title="Graph RAG: entities, relationships & paths"
        steps={["Question", "Identify entities", "Link to graph nodes", "Traverse k hops (+ vectors)", "Subgraph + paths", "LLM", "Answer + evidence"]}
        c1="#f472b6"
        c2="#fbbf24"
        out="Grounded answer with the exact relationship paths used: explainable and multi-hop."
      />
    </div>
  );
}

/* ---------------- 2.2 Taxonomy vs ontology ---------------- */
export function TaxonomyOntology() {
  const tree = [
    { t: "Artificial Intelligence", x: 200, y: 25, c: "#c084fc" },
    { t: "Machine Learning", x: 110, y: 85, c: "#22d3ee", p: 0 },
    { t: "NLP", x: 300, y: 85, c: "#f472b6", p: 0 },
    { t: "Deep Learning", x: 60, y: 150, c: "#34d399", p: 1 },
    { t: "Classical ML", x: 170, y: 150, c: "#34d399", p: 1 },
    { t: "LLMs", x: 300, y: 150, c: "#fbbf24", p: 2 },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Panel title="Taxonomy: IS-A hierarchy" accent="#22d3ee">
        <svg viewBox="0 0 400 180" className="w-full">
          {tree.map((n, i) => n.p !== undefined && <line key={i} x1={tree[n.p].x} y1={tree[n.p].y + 12} x2={n.x} y2={n.y - 12} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />)}
          {tree.map((n) => (
            <g key={n.t}>
              <rect x={n.x - 60} y={n.y - 13} width={120} height={26} rx={13} fill={n.c + "33"} stroke={n.c} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={10.5} fill="#fff" fontWeight={600}>
                {n.t}
              </text>
            </g>
          ))}
        </svg>
      </Panel>
      <Panel title="Ontology: classes + relations + rules" accent="#f472b6">
        <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-pink-100">{`Class  Person
Class  Employee   subClassOf Person
Class  Department
Class  Project

Relation WORKS_IN   domain Employee  range Department  (exactly 1)
Relation WORKS_ON   domain Employee  range Project
Relation MANAGES    domain Employee  range Employee  (irreflexive)

Rule: MANAGES(a,b) ∧ WORKS_ON(b,p) ⇒ OVERSEES(a,p)`}</pre>
      </Panel>
    </div>
  );
}

/* ---------------- 2.3 RDF vs LPG ---------------- */
export function RdfVsLpg() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Panel title="RDF: every fact is a triple, identified by a URI" accent="#22d3ee">
        <svg viewBox="0 0 360 170" className="w-full">
          {[
            [60, 50, "ex:John"],
            [300, 50, "ex:IBM"],
            [180, 140, "_:stmt1"],
            [60, 140, '"AI Engineer"'],
            [300, 140, '"2021"'],
          ].map(([x, y, t], i) => (
            <g key={i}>
              {i < 3 ? (
                <ellipse cx={x as number} cy={y as number} rx={48} ry={17} fill="#0e7490" stroke="#22d3ee" />
              ) : (
                <rect x={(x as number) - 46} y={(y as number) - 14} width={92} height={28} fill="#164e63" stroke="#67e8f9" strokeDasharray="3 2" />
              )}
              <text x={x as number} y={(y as number) + 4} textAnchor="middle" fontSize={10} fill="#cffafe" className="font-mono">
                {t}
              </text>
            </g>
          ))}
          <line x1={108} y1={50} x2={252} y2={50} stroke="#67e8f9" strokeWidth={1.5} />
          <text x={180} y={44} textAnchor="middle" fontSize={9} fill="#a5f3fc" className="font-mono">
            ex:worksFor
          </text>
          <line x1={60} y1={67} x2={60} y2={126} stroke="#67e8f9" />
          <text x={64} y={100} fontSize={8.5} fill="#a5f3fc" className="font-mono">
            ex:role
          </text>
          <line x1={150} y1={127} x2={80} y2={64} stroke="#67e8f9" strokeDasharray="2 2" />
          <line x1={210} y1={127} x2={285} y2={64} stroke="#67e8f9" strokeDasharray="2 2" />
          <line x1={228} y1={140} x2={254} y2={140} stroke="#67e8f9" />
          <text x={180} y={118} textAnchor="middle" fontSize={8} fill="#a5f3fc">
            reification for edge property
          </text>
        </svg>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-2 font-mono text-[10.5px] text-cyan-100">{`ex:John ex:worksFor ex:IBM .
ex:John ex:role "AI Engineer" .
<< ex:John ex:worksFor ex:IBM >> ex:since 2021 .  # RDF-star`}</pre>
      </Panel>
      <Panel title="Labeled Property Graph: properties live on nodes AND edges" accent="#f472b6">
        <svg viewBox="0 0 360 170" className="w-full">
          <circle cx={70} cy={80} r={42} fill="#a78bfa" />
          <text x={70} y={76} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1e1b4b">
            John
          </text>
          <text x={70} y={92} textAnchor="middle" fontSize={8.5} fill="#1e1b4b" className="font-mono">
            :Person
          </text>
          <circle cx={290} cy={80} r={42} fill="#f472b6" />
          <text x={290} y={76} textAnchor="middle" fontSize={12} fontWeight={800} fill="#500724">
            IBM
          </text>
          <text x={290} y={92} textAnchor="middle" fontSize={8.5} fill="#500724" className="font-mono">
            :Company
          </text>
          <line x1={112} y1={80} x2={246} y2={80} stroke="#fde047" strokeWidth={2.5} className="dash-move" />
          <text x={180} y={72} textAnchor="middle" fontSize={10} fill="#fef08a" fontWeight={700} className="font-mono">
            :WORKS_FOR
          </text>
          <text x={180} y={96} textAnchor="middle" fontSize={9} fill="#fde68a" className="font-mono">
            {"{since: 2021}"}
          </text>
          <text x={70} y={145} textAnchor="middle" fontSize={9} fill="#ddd6fe" className="font-mono">
            {"{role: 'AI Engineer'}"}
          </text>
          <text x={290} y={145} textAnchor="middle" fontSize={9} fill="#fbcfe8" className="font-mono">
            {"{hq: 'Armonk'}"}
          </text>
        </svg>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-2 font-mono text-[10.5px] text-pink-100">{`CREATE (:Person {name:'John', role:'AI Engineer'})
       -[:WORKS_FOR {since: 2021}]->
       (:Company {name:'IBM', hq:'Armonk'})`}</pre>
      </Panel>
    </div>
  );
}

/* ---------------- 2.5 Inference demo ---------------- */
export function InferenceDemo() {
  const base = useMemo<GraphData>(() => {
    const keep = new Set(["Employee", "Project"]);
    const nodes = ENTERPRISE_KG.nodes.filter((n) => keep.has(n.label));
    const ids = new Set(nodes.map((n) => n.id));
    return { nodes, edges: ENTERPRISE_KG.edges.filter((e) => ids.has(e.source) && ids.has(e.target) && (e.type === "MANAGES" || e.type === "WORKS_ON")) };
  }, []);
  const inferred = useMemo(() => {
    const out: KGEdge[] = [];
    const seen = new Set<string>();
    base.edges
      .filter((e) => e.type === "MANAGES")
      .forEach((m) =>
        base.edges
          .filter((w) => w.type === "WORKS_ON" && w.source === m.target)
          .forEach((w) => {
            const k = m.source + w.target;
            if (seen.has(k)) return;
            seen.add(k);
            out.push({ id: "inf" + out.length, source: m.source, target: w.target, type: "OVERSEES" });
          }),
      );
    return out;
  }, [base]);
  const [applied, setApplied] = useState(false);
  const data = applied ? { nodes: base.nodes, edges: [...base.edges, ...inferred] } : base;
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <code className="rounded-lg bg-black/40 px-3 py-1.5 font-mono text-xs text-amber-200">
          (a)-[:MANAGES]-&gt;(b)-[:WORKS_ON]-&gt;(p) ⇒ (a)-[:OVERSEES]-&gt;(p)
        </code>
        <button
          onClick={() => setApplied((a) => !a)}
          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-sm font-semibold text-black"
        >
          <Sparkles size={14} /> {applied ? "Remove inferred facts" : `Apply rule (+${inferred.length} facts)`}
        </button>
      </div>
      <GraphCanvas data={data} height={360} highlight={applied ? { nodes: [], edges: inferred.map((e) => e.id) } : null} />
      <p className="mt-2 text-xs text-white/55">
        Inferred <span className="font-mono text-yellow-200">OVERSEES</span> edges glow yellow. In Neo4j you would materialise them with{" "}
        <code className="text-amber-200">MATCH … MERGE (a)-[:OVERSEES]-&gt;(p)</code>.
      </p>
    </div>
  );
}

/* ---------------- 2.6 Enterprise KG + keyword vs graph ---------------- */
export function EnterpriseKG() {
  return <KGExplorer height={480} />;
}

const KW_RESULT = runCypher(
  new Graph(ENTERPRISE_KG),
  `MATCH (t:Technology {name:"LangGraph"})<-[:USES]-(p:Project)<-[:WORKS_ON]-(e:Employee)-[k:KNOWS]->(s:Skill {name:"Agentic AI"}) RETURN e.name AS mentor, k.level AS level, collect(DISTINCT p.name) AS via_projects`,
);

export function KeywordVsGraph() {
  const term = "LangGraph";
  const hits = ENTERPRISE_DOCS.filter((d) => d.text.includes(term));
  const res = KW_RESULT;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Panel title={`🔎 Keyword search: "${term}"`} accent="#22d3ee">
        <p className="mb-2 text-xs text-white/55">Question: “Who could mentor a new LangGraph project?”</p>
        {hits.map((h) => (
          <div key={h.id} className="mb-2 rounded-lg bg-black/30 p-2 text-xs">
            <div className="font-semibold text-cyan-200">{h.title}</div>
            <div className="text-white/70">
              {h.text.split(term).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <mark className="rounded bg-cyan-400/40 px-0.5 text-white">{term}</mark>}
                </span>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-rose-300">✗ Finds projects that mention LangGraph, but says nothing about who has the right skills.</p>
      </Panel>
      <Panel title="🕸️ Graph traversal" accent="#f472b6">
        <pre className="mb-2 overflow-x-auto rounded-lg bg-black/40 p-2 font-mono text-[10.5px] text-pink-100">{`(:Technology {name:"LangGraph"})<-[:USES]-(p:Project)
   <-[:WORKS_ON]-(e:Employee)-[:KNOWS]->(:Skill {name:"Agentic AI"})`}</pre>
        {res.rows.map((r, i) => (
          <div key={i} className="mb-1.5 flex items-center justify-between rounded-lg bg-pink-500/10 px-3 py-2 text-sm">
            <span className="font-semibold">{String(r[0])}</span>
            <span className="text-xs text-white/60">
              {String(r[1])} · via {(r[2] as string[]).join(", ")}
            </span>
          </div>
        ))}
        <p className="mt-2 text-xs text-emerald-300">✓ Combines technology, project, people and skill data. The answer comes from the connections.</p>
      </Panel>
    </div>
  );
}

/* ---------------- 3.1 Neo4j architecture ---------------- */
export function Neo4jArchitecture() {
  const rows = [
    { t: "Clients", items: ["Neo4j Browser", "Bloom", "Python / JS / Java drivers", "LangChain · LlamaIndex"], c: "#c084fc" },
    { t: "Protocols", items: ["Bolt (binary, 7687)", "HTTP API", "GraphQL"], c: "#22d3ee" },
    { t: "Cypher engine", items: ["Parser", "Cost-based planner", "Pipelined runtime"], c: "#34d399" },
    { t: "Transactions & cluster", items: ["ACID", "Write-ahead log", "Raft clustering", "Read replicas"], c: "#fbbf24" },
    { t: "Native graph storage", items: ["Node store", "Relationship store (linked lists)", "Property store", "Index-free adjacency"], c: "#f472b6" },
    { t: "Indexes & extensions", items: ["Range / text / full-text", "Vector index", "APOC", "Graph Data Science"], c: "#fb923c" },
  ];
  return (
    <div className="glass space-y-1.5 rounded-2xl p-4">
      <div className="mb-2 text-sm font-bold text-emerald-300">Neo4j architecture</div>
      {rows.map((r) => (
        <div key={r.t} className="grid grid-cols-[150px_1fr] items-center gap-2">
          <div className="rounded-lg px-3 py-2 text-xs font-bold" style={{ background: r.c + "30", color: r.c }}>
            {r.t}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {r.items.map((i) => (
              <span key={i} className="rounded-md border px-2 py-1 text-[11px]" style={{ borderColor: r.c + "44" }}>
                {i}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 3.3 Cypher anatomy ---------------- */
export function CypherAnatomy() {
  const parts: [string, string, string][] = [
    ["(", "#fff", ""],
    ["e", "#fbbf24", "variable"],
    [":Employee", "#c084fc", "label"],
    [")", "#fff", ""],
    ["-[", "#fff", ""],
    [":WORKS_ON", "#22d3ee", "rel type"],
    ["]->", "#f472b6", "direction"],
    ["(", "#fff", ""],
    ["p", "#fbbf24", "variable"],
    [":Project ", "#c084fc", "label"],
    ['{status:"Pilot"}', "#34d399", "property filter"],
    [")", "#fff", ""],
  ];
  const clauses = [
    ["MATCH", "the pattern above", "#c084fc"],
    ["WHERE", "e.since < 2022", "#fbbf24"],
    ["RETURN", "e.name, p.name", "#22d3ee"],
    ["ORDER BY", "e.name", "#34d399"],
    ["LIMIT", "10", "#f472b6"],
  ];
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-1 text-xs uppercase tracking-wider text-white/50">Cypher is ASCII-art: (node)-[:REL]-&gt;(node)</div>
      <div className="flex flex-wrap items-end justify-center gap-0.5 overflow-x-auto py-4 font-mono text-lg sm:text-2xl">
        {parts.map(([t, c, lab], i) => (
          <div key={i} className="flex flex-col items-center">
            <span style={{ color: c }} className="font-bold">
              {t}
            </span>
            <span className="mt-1 h-4 text-[9px] font-sans uppercase tracking-wide" style={{ color: c }}>
              {lab}
            </span>
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-5">
        {clauses.map(([k, v, c]) => (
          <div key={k} className="rounded-xl border p-2 text-center" style={{ borderColor: c + "55", background: c + "14" }}>
            <div className="font-mono text-sm font-bold" style={{ color: c }}>
              {k}
            </div>
            <div className="font-mono text-[11px] text-white/70">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 3.4 Schema diagram ---------------- */
export function SchemaDiagram() {
  const N: Record<string, [number, number]> = {
    Employee: [300, 130],
    Department: [90, 60],
    Project: [520, 130],
    Skill: [90, 210],
    Technology: [700, 60],
    Domain: [700, 210],
  };
  const E: [string, string, string][] = [
    ["Employee", "Department", "WORKS_IN"],
    ["Employee", "Project", "WORKS_ON"],
    ["Employee", "Skill", "KNOWS"],
    ["Project", "Technology", "USES"],
    ["Project", "Domain", "RELATED_TO"],
  ];
  return (
    <div className="glass overflow-x-auto rounded-2xl p-4">
      <svg viewBox="0 0 790 270" className="min-w-[620px] w-full">
        <defs>
          <marker id="sarrow" viewBox="0 -5 10 10" refX="10" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,-5L10,0L0,5" fill="#e9d5ff" />
          </marker>
        </defs>
        {E.map(([a, b, t]) => {
          const [x1, y1] = N[a];
          const [x2, y2] = N[b];
          const dx = x2 - x1;
          const dy = y2 - y1;
          const l = Math.hypot(dx, dy);
          return (
            <g key={t}>
              <line x1={x1 + (dx / l) * 46} y1={y1 + (dy / l) * 46} x2={x2 - (dx / l) * 46} y2={y2 - (dy / l) * 46} stroke="#e9d5ff" strokeWidth={1.8} markerEnd="url(#sarrow)" className="dash-move" />
              <rect x={(x1 + x2) / 2 - 42} y={(y1 + y2) / 2 - 10} width={84} height={20} rx={10} fill="#0b0820" stroke="rgba(255,255,255,0.2)" />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fontSize={10} fill="#67e8f9" className="font-mono">
                {t}
              </text>
            </g>
          );
        })}
        <path d="M 270 95 C 230 20, 370 20, 330 95" fill="none" stroke="#e9d5ff" strokeWidth={1.8} markerEnd="url(#sarrow)" />
        <text x={300} y={30} textAnchor="middle" fontSize={10} fill="#67e8f9" className="font-mono">
          MANAGES
        </text>
        {Object.entries(N).map(([l, [x, y]]) => (
          <g key={l}>
            <circle cx={x} cy={y} r={44} fill={colorFor(l)} opacity={0.2} />
            <circle cx={x} cy={y} r={38} fill={colorFor(l)} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="#0b0820">
              {l}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function QueryRunner() {
  return <CypherPlayground compact />;
}

/* ---------------- 3.6 GDS centrality + communities ---------------- */
export function GdsCentrality() {
  const g = useMemo(() => new Graph(ENTERPRISE_KG), []);
  const ranks = useMemo(
    () =>
      [...g.nodes.values()]
        .map((n) => ({ n, d: g.neighbors(n.id).length }))
        .sort((a, b) => b.d - a.d)
        .slice(0, 10),
    [g],
  );
  const max = ranks[0].d;
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 text-sm font-bold text-emerald-300">Degree centrality: the most connected entities in NovaTech</div>
      <div className="space-y-1.5">
        {ranks.map(({ n, d }, i) => (
          <div key={n.id} className="grid grid-cols-[150px_1fr_30px] items-center gap-2 text-xs">
            <span className="truncate text-right">
              <span className="mr-1 text-white/40">#{i + 1}</span>
              {n.name}
            </span>
            <div className="h-4 overflow-hidden rounded-r-md bg-white/5">
              <div className="h-full rounded-r-md" style={{ width: `${(d / max) * 100}%`, background: `linear-gradient(90deg, ${colorFor(n.label)}66, ${colorFor(n.label)})` }} />
            </div>
            <span className="tabular-nums text-white/60">{d}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-white/45">
        Computed live from the in-browser graph. In Neo4j: <code className="text-emerald-200">CALL gds.degree.stream(&apos;org&apos;)</code> or PageRank for influence that accounts for neighbours&apos; importance.
      </p>
    </div>
  );
}

export const CUSTOM_A: Record<string, () => React.ReactElement> = {
  "rdbms-vs-graph": RdbmsVsGraph,
  "triple-anatomy": TripleAnatomy,
  "mini-kg": MiniKG,
  representations: Representations,
  "multihop-demo": MultiHopDemo,
  "rag-vs-graphrag-flow": RagVsGraphRagFlow,
  "taxonomy-ontology": TaxonomyOntology,
  "rdf-vs-lpg": RdfVsLpg,
  "inference-demo": InferenceDemo,
  "enterprise-kg": EnterpriseKG,
  "keyword-vs-graph": KeywordVsGraph,
  "neo4j-architecture": Neo4jArchitecture,
  "cypher-anatomy": CypherAnatomy,
  "schema-diagram": SchemaDiagram,
  "query-runner": QueryRunner,
  "gds-centrality": GdsCentrality,
};

export { PALETTE };
