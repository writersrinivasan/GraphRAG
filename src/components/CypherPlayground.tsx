"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Play, Timer } from "lucide-react";
import GraphCanvas from "./GraphCanvas";
import { Graph } from "@/lib/kg/graph";
import { ENTERPRISE_KG } from "@/lib/kg/data";
import { CypherResult, runCypher } from "@/lib/kg/cypher";

export const PRESETS: { title: string; level: string; q: string }[] = [
  { title: "Who knows what?", level: "Basic", q: `MATCH (e:Employee)-[:KNOWS]->(s:Skill)\nRETURN e.name, s.name\nLIMIT 15` },
  { title: "Employee → Project → Technology", level: "Multi-hop", q: `MATCH (e:Employee)-[:WORKS_ON]->(p:Project)-[:USES]->(t:Technology)\nRETURN e.name, p.name, t.name\nLIMIT 20` },
  { title: "Python AND Agentic AI", level: "Pattern join", q: `MATCH (e:Employee)-[:KNOWS]->(:Skill {name: "Python"}),\n      (e)-[:KNOWS]->(:Skill {name: "Agentic AI"})\nRETURN e.name AS employee, e.role AS role` },
  { title: "Projects using LangChain & Neo4j", level: "Pattern join", q: `MATCH (p:Project)-[:USES]->(:Technology {name: "LangChain"}),\n      (p)-[:USES]->(:Technology {name: "Neo4j"})\nRETURN p.name, p.status` },
  { title: "Who works on Generative AI?", level: "Multi-hop", q: `MATCH (e:Employee)-[:WORKS_ON]->(p:Project)-[:RELATED_TO]->(d:Domain {name: "Generative AI"})\nRETURN e.name AS employee, collect(p.name) AS projects\nORDER BY employee` },
  { title: "Most-used technologies", level: "Aggregation", q: `MATCH (p:Project)-[:USES]->(t:Technology)\nRETURN t.name AS technology, count(p) AS projects, collect(p.name) AS used_in\nORDER BY projects DESC\nLIMIT 5` },
  { title: "Reporting chain (variable length)", level: "Variable-length", q: `MATCH (m:Employee)-[:MANAGES*1..2]->(e:Employee)\nRETURN m.name AS manager, collect(e.name) AS reports` },
  { title: "Experts who joined before 2020", level: "WHERE", q: `MATCH (e:Employee)-[k:KNOWS]->(s:Skill)\nWHERE k.level = "Expert" AND e.since < 2020\nRETURN e.name, e.since, s.name\nORDER BY e.since` },
  { title: "Connect John → Neo4j", level: "Path", q: `MATCH (e:Employee {name: "John Miller"})-[*1..2]-(t:Technology {name: "Neo4j"})\nRETURN e.name, t.name` },
  { title: "Department skill coverage", level: "Aggregation", q: `MATCH (d:Department)<-[:WORKS_IN]-(e:Employee)-[:KNOWS]->(s:Skill)\nRETURN d.name AS department, count(DISTINCT s) AS skills, collect(DISTINCT s.name) AS skill_list\nORDER BY skills DESC` },
];

function Cell({ v }: { v: unknown }) {
  if (Array.isArray(v))
    return (
      <div className="flex flex-wrap gap-1">
        {v.map((x, i) => (
          <span key={i} className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px]">
            {typeof x === "object" ? JSON.stringify(x) : String(x)}
          </span>
        ))}
      </div>
    );
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return (
      <span className="font-mono text-[11px]">
        <span className="text-cyan-300">({String(o._node ?? o._rel)})</span> {String(o.name ?? "")}
      </span>
    );
  }
  return <span>{v === null ? <i className="text-white/30">null</i> : String(v)}</span>;
}

export default function CypherPlayground({ compact = false, initial = 1 }: { compact?: boolean; initial?: number }) {
  const g = useMemo(() => new Graph(ENTERPRISE_KG), []);
  const [q, setQ] = useState(PRESETS[initial].q);
  const [res, setRes] = useState<CypherResult | null>(null);
  const [active, setActive] = useState(initial);

  const run = (query = q) => setRes(runCypher(g, query));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.slice(0, compact ? 6 : PRESETS.length).map((p, i) => (
          <button
            key={p.title}
            onClick={() => {
              setQ(p.q);
              setActive(i);
              run(p.q);
            }}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              active === i ? "border-emerald-400 bg-emerald-500/20 text-emerald-100" : "border-white/10 text-white/70 hover:border-white/30"
            }`}
          >
            <span className="mr-1 text-[10px] text-emerald-300/80">{p.level}</span>
            {p.title}
          </button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0718]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="font-mono text-xs text-emerald-300">neo4j$</span>
              <button
                onClick={() => run()}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1 text-xs font-semibold text-black hover:brightness-110"
              >
                <Play size={12} /> Run (⌘↵)
              </button>
            </div>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
              }}
              spellCheck={false}
              rows={compact ? 5 : 7}
              className="w-full resize-y bg-transparent p-3 font-mono text-[13px] leading-relaxed text-emerald-100 outline-none"
            />
          </div>
          <div className="min-h-[140px] overflow-auto rounded-2xl border border-white/10 bg-black/30" style={{ maxHeight: compact ? 220 : 300 }}>
            {!res && <p className="p-4 text-sm text-white/40">Run a query to see results. Matching nodes &amp; relationships light up in the graph.</p>}
            {res?.error && (
              <div className="flex gap-2 p-4 text-sm text-rose-300">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {res.error}
              </div>
            )}
            {res && !res.error && (
              <>
                <div className="flex items-center gap-3 border-b border-white/10 px-3 py-1.5 text-[11px] text-white/50">
                  <span>{res.rows.length} rows</span>
                  <span className="flex items-center gap-1">
                    <Timer size={11} /> {res.ms} ms
                  </span>
                  <span>
                    {res.highlight.nodes.length} nodes · {res.highlight.edges.length} rels matched
                  </span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#140f2e]">
                    <tr>
                      {res.columns.map((c) => (
                        <th key={c} className="px-3 py-2 font-mono font-semibold text-fuchsia-300">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {res.rows.map((r, i) => (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                        {r.map((v, j) => (
                          <td key={j} className="px-3 py-1.5 align-top">
                            <Cell v={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
        <GraphCanvas data={ENTERPRISE_KG} height={compact ? 420 : 520} highlight={res && !res.error ? res.highlight : null} />
      </div>
      <p className="text-[11px] text-white/40">
        In-browser Cypher subset: MATCH (multiple patterns, *min..max), WHERE (AND/OR/NOT, =, &lt;&gt;, &lt;, &gt;, CONTAINS, STARTS WITH, IN), RETURN [DISTINCT], count/collect/sum/avg/min/max,
        labels(), type(), toLower(), AS, ORDER BY, LIMIT. The same queries run unchanged on Neo4j.
      </p>
    </div>
  );
}
