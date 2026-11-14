"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import GraphCanvas from "../GraphCanvas";
import { CodeBlock } from "../CodeBlock";
import { triplesToGraph } from "../visuals/CustomB";
import { colorFor } from "@/lib/kg/types";

export interface T {
  subject: string;
  subject_type: string;
  relation: string;
  object: string;
  object_type: string;
}

const STARTER: T[] = [
  { subject: "Asha", subject_type: "Employee", relation: "WORKS_IN", object: "AI Research", object_type: "Department" },
  { subject: "Asha", subject_type: "Employee", relation: "WORKS_ON", object: "Chatbot 2.0", object_type: "Project" },
  { subject: "Asha", subject_type: "Employee", relation: "KNOWS", object: "Python", object_type: "Skill" },
  { subject: "Ben", subject_type: "Employee", relation: "MANAGES", object: "Asha", object_type: "Employee" },
  { subject: "Ben", subject_type: "Employee", relation: "WORKS_IN", object: "AI Research", object_type: "Department" },
  { subject: "Chatbot 2.0", subject_type: "Project", relation: "USES", object: "LangGraph", object_type: "Technology" },
  { subject: "Chatbot 2.0", subject_type: "Project", relation: "USES", object: "Neo4j", object_type: "Technology" },
  { subject: "Chen", subject_type: "Employee", relation: "WORKS_ON", object: "Chatbot 2.0", object_type: "Project" },
  { subject: "Chen", subject_type: "Employee", relation: "KNOWS", object: "Cypher", object_type: "Skill" },
];

const TYPES = ["Employee", "Department", "Project", "Technology", "Skill", "Organization", "Concept"];
const RELS = ["WORKS_IN", "WORKS_ON", "KNOWS", "MANAGES", "USES", "RELATED_TO", "PART_OF"];

export function toCypher(triples: T[]) {
  const nodes = new Map<string, string>();
  triples.forEach((t) => {
    nodes.set(t.subject, t.subject_type);
    nodes.set(t.object, t.object_type);
  });
  const types = [...new Set(nodes.values())];
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const id = (s: string) => s.replace(/[^A-Za-z0-9_]/g, "_") || "Entity";
  const lines = [
    "// 1. Constraints (run once)",
    ...types.map((t) => `CREATE CONSTRAINT ${id(t).toLowerCase()}_name IF NOT EXISTS FOR (n:${id(t)}) REQUIRE n.name IS UNIQUE;`),
    "",
    "// 2. Nodes + relationships (idempotent MERGE)",
    ...triples.map(
      (t) => `MERGE (a:${id(t.subject_type)} {name: "${esc(t.subject)}"})\nMERGE (b:${id(t.object_type)} {name: "${esc(t.object)}"})\nMERGE (a)-[:${id(t.relation)}]->(b);`,
    ),
  ];
  return lines.join("\n");
}

export default function Lab1Builder() {
  const [triples, setTriples] = useState<T[]>(STARTER.slice(0, 3));
  const [f, setF] = useState<T>({ subject: "", subject_type: "Employee", relation: "KNOWS", object: "", object_type: "Skill" });
  const [tab, setTab] = useState<"triples" | "adj" | "cypher">("triples");
  const graph = useMemo(() => triplesToGraph(triples), [triples]);

  const add = () => {
    if (!f.subject.trim() || !f.object.trim()) return;
    setTriples((t) => [...t, { ...f, subject: f.subject.trim(), object: f.object.trim(), relation: f.relation.trim().toUpperCase().replace(/\s+/g, "_") }]);
    setF({ ...f, object: "" });
  };

  const adj = useMemo(() => {
    const m = new Map<string, string[]>();
    triples.forEach((t) => m.set(t.subject, [...(m.get(t.subject) ?? []), `${t.relation}→${t.object}`]));
    return [...m.entries()];
  }, [triples]);

  const inp = "rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm outline-none focus:border-fuchsia-400";
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold">Add a triple: (subject)-[:RELATION]→(object)</h3>
          <div className="flex gap-2">
            <button onClick={() => setTriples(STARTER)} className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1 text-xs hover:bg-white/10">
              <Wand2 size={12} /> Load starter set
            </button>
            <button onClick={() => setTriples([])} className="rounded-lg border border-white/15 px-3 py-1 text-xs hover:bg-white/10">
              Clear
            </button>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_1fr_auto_auto]">
          <input className={inp} placeholder="Subject e.g. Asha" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
          <select className={inp} value={f.subject_type} onChange={(e) => setF({ ...f, subject_type: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t} className="bg-slate-900">
                {t}
              </option>
            ))}
          </select>
          <input className={`${inp} font-mono`} list="rels" value={f.relation} onChange={(e) => setF({ ...f, relation: e.target.value })} />
          <datalist id="rels">
            {RELS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
          <input className={inp} placeholder="Object e.g. Python" value={f.object} onChange={(e) => setF({ ...f, object: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} />
          <select className={inp} value={f.object_type} onChange={(e) => setF({ ...f, object_type: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t} className="bg-slate-900">
                {t}
              </option>
            ))}
          </select>
          <button onClick={add} className="flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1.5 text-sm font-semibold">
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="mt-2 text-xs text-white/45">Tip: reuse an existing name (e.g. “Asha”) and the new fact attaches to the same node. That is how a graph grows connected.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <GraphCanvas data={graph} height={460} showEdgeLabels="always" />
          <div className="mt-2 flex gap-4 text-xs text-white/60">
            <span>
              <b className="text-fuchsia-300">{graph.nodes.length}</b> nodes
            </span>
            <span>
              <b className="text-cyan-300">{graph.edges.length}</b> relationships
            </span>
            <span>
              <b className="text-amber-300">{new Set(graph.nodes.map((n) => n.label)).size}</b> labels
            </span>
          </div>
        </div>
        <div className="glass rounded-2xl p-3">
          <div className="mb-2 flex gap-1">
            {(
              [
                ["triples", "Triples"],
                ["adj", "Adjacency list"],
                ["cypher", "Export Cypher"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-3 py-1 text-xs ${tab === k ? "bg-white/15" : "text-white/50 hover:bg-white/5"}`}>
                {l}
              </button>
            ))}
          </div>
          {tab === "triples" && (
            <div className="max-h-[420px] space-y-1 overflow-y-auto">
              {triples.map((t, i) => (
                <div key={i} className="group flex items-center gap-1.5 rounded-lg bg-black/30 px-2 py-1.5 font-mono text-[11px]">
                  <span style={{ color: colorFor(t.subject_type) }}>{t.subject}</span>
                  <span className="text-cyan-300">-[:{t.relation}]→</span>
                  <span style={{ color: colorFor(t.object_type) }}>{t.object}</span>
                  <button onClick={() => setTriples((x) => x.filter((_, j) => j !== i))} className="ml-auto opacity-0 group-hover:opacity-100" aria-label="Delete triple">
                    <Trash2 size={12} className="text-rose-300" />
                  </button>
                </div>
              ))}
              {!triples.length && <p className="p-2 text-xs text-white/40">No triples yet.</p>}
            </div>
          )}
          {tab === "adj" && (
            <div className="max-h-[420px] space-y-1 overflow-y-auto font-mono text-[11px]">
              {adj.map(([k, v]) => (
                <div key={k} className="rounded-lg bg-black/30 px-2 py-1.5">
                  <span className="text-amber-300">{k}</span> → [{v.join(", ")}]
                </div>
              ))}
            </div>
          )}
          {tab === "cypher" && (
            <div className="max-h-[420px] overflow-y-auto">
              <CodeBlock sample={{ title: "build_graph.cypher (paste into Neo4j Browser)", lang: "cypher", code: toCypher(triples) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
