"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Merge } from "lucide-react";
import GraphCanvas from "../GraphCanvas";
import { CodeTabs } from "../CodeBlock";
import { triplesToGraph } from "../visuals/CustomB";
import { T, toCypher } from "./Lab1Builder";

const MESSY: T[] = [
  { subject: "John Miller", subject_type: "Person", relation: "WORKS_AT", object: "Microsoft", object_type: "Organization" },
  { subject: "John", subject_type: "Person", relation: "HAS_ROLE", object: "AI Engineer", object_type: "Role" },
  { subject: "J. Miller", subject_type: "Person", relation: "uses", object: "python", object_type: "Technology" },
  { subject: "John Miller", subject_type: "Person", relation: "USES", object: "LangChain", object_type: "Technology" },
  { subject: "Sara Lee", subject_type: "Person", relation: "WORKS_AT", object: "MSFT", object_type: "Organization" },
  { subject: "Sara Lee", subject_type: "Person", relation: "WORKS_AT", object: "Microsoft Corp.", object_type: "Company" },
  { subject: "Sara Lee", subject_type: "Person", relation: "USES", object: "Python", object_type: "Technology" },
  { subject: "Sara Lee", subject_type: "Person", relation: "MANAGES", object: "John Miller", object_type: "Person" },
  { subject: "LangChain", subject_type: "Technology", relation: "INTEGRATES_WITH", object: "Neo4j", object_type: "Technology" },
  { subject: "Neo4j", subject_type: "Technology", relation: "IS_A", object: "Neo4j", object_type: "Technology" },
];

const ALIASES: Record<string, string> = { msft: "microsoft", "j. miller": "john miller" };

function normKey(s: string) {
  const k = s
    .toLowerCase()
    .replace(/\b(inc|corp|corporation|ltd|llc)\.?$/g, "")
    .replace(/[^a-z0-9. ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return ALIASES[k] ?? k.replace(/\./g, "");
}

interface Candidate {
  canonical: string;
  variants: string[];
  reason: string;
}

function findCandidates(triples: T[]): Candidate[] {
  const names = [...new Set(triples.flatMap((t) => [t.subject, t.object]))];
  const groups = new Map<string, string[]>();
  names.forEach((n) => groups.set(normKey(n), [...(groups.get(normKey(n)) ?? []), n]));
  const out: Candidate[] = [];
  const keys = [...groups.keys()];
  // first-name → full-name (only when unambiguous)
  for (const k of keys) {
    if (k.includes(" ")) continue;
    const longer = keys.filter((o) => o !== k && o.startsWith(k + " "));
    if (longer.length === 1) {
      groups.set(longer[0], [...groups.get(longer[0])!, ...groups.get(k)!]);
      groups.delete(k);
    }
  }
  for (const [, variants] of groups) {
    if (variants.length < 2) continue;
    // prefer: no legal suffix, no abbreviation dot, capitalised, then longest
    const score = (v: string) => (/\b(corp|inc|ltd|llc)\b/i.test(v) ? 0 : 100) + (/\./.test(v) ? 0 : 50) + (/^[A-Z]/.test(v) ? 25 : 0) + v.length;
    const canonical = [...variants].sort((a, b) => score(b) - score(a))[0];
    out.push({ canonical, variants, reason: "case / punctuation / suffix / alias / first-name match" });
  }
  return out;
}

export default function Lab4Construct() {
  const [source, setSource] = useState<"sample" | "lab3">("sample");
  const [raw, setRaw] = useState<T[]>(MESSY);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const s = sessionStorage.getItem("lab3_triples");
      if (s && new URLSearchParams(window.location.search).get("from") === "lab3") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- load hand-off from Lab 3
        setRaw(JSON.parse(s));
        setSource("lab3");
      }
    } catch {}
  }, []);

  const candidates = useMemo(() => findCandidates(raw), [raw]);

  const resolved = useMemo(() => {
    const map = new Map<string, string>();
    candidates.forEach((c) => applied.has(c.canonical) && c.variants.forEach((v) => map.set(v, c.canonical)));
    const typeOf = new Map<string, string>();
    const fixRel = (r: string) => r.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
    const out: T[] = [];
    const seen = new Set<string>();
    for (const t of raw) {
      const s = map.get(t.subject) ?? t.subject;
      const o = map.get(t.object) ?? t.object;
      // first type seen wins for a canonical entity
      if (!typeOf.has(s)) typeOf.set(s, t.subject_type);
      if (!typeOf.has(o)) typeOf.set(o, t.object_type);
      const tr = { subject: s, subject_type: typeOf.get(s)!, relation: applied.size ? fixRel(t.relation) : t.relation, object: o, object_type: typeOf.get(o)! };
      const k = `${s}|${tr.relation}|${o}`;
      if (applied.size && seen.has(k)) continue;
      seen.add(k);
      out.push(tr);
    }
    return out;
  }, [raw, candidates, applied]);

  const validation = useMemo(() => {
    const issues: { level: "error" | "warn"; msg: string }[] = [];
    resolved.forEach((t) => {
      if (t.subject === t.object) issues.push({ level: "error", msg: `Self-loop: (${t.subject})-[:${t.relation}]->(${t.object})` });
      if (!/^[A-Z][A-Z0-9_]*$/.test(t.relation)) issues.push({ level: "warn", msg: `Relationship not UPPER_SNAKE_CASE: ${t.relation}` });
    });
    const types = new Map<string, Set<string>>();
    raw.forEach((t) => {
      [
        [t.subject, t.subject_type],
        [t.object, t.object_type],
      ].forEach(([n, ty]) => types.set(n, new Set([...(types.get(n) ?? []), ty])));
    });
    types.forEach((v, n) => v.size > 1 && issues.push({ level: "warn", msg: `Type conflict for "${n}": ${[...v].join(" vs ")}` }));
    return issues;
  }, [resolved, raw]);

  const valid = resolved.filter((t) => t.subject !== t.object);
  const before = triplesToGraph(raw);
  const after = triplesToGraph(valid);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Source: {source === "lab3" ? "your Lab 3 extraction" : "messy sample extraction"}</span>
        {source === "lab3" && (
          <button
            onClick={() => {
              setRaw(MESSY);
              setSource("sample");
              setApplied(new Set());
            }}
            className="text-xs text-white/50 underline"
          >
            use sample instead
          </button>
        )}
        <span className="ml-auto text-xs text-white/60">
          Before: <b>{before.nodes.length}</b> nodes / <b>{before.edges.length}</b> rels → After: <b className="text-emerald-300">{after.nodes.length}</b> nodes / <b className="text-emerald-300">{after.edges.length}</b> rels
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <div className="glass rounded-2xl p-4">
            <h4 className="mb-2 flex items-center gap-2 font-bold">
              <Merge size={16} className="text-amber-300" /> Step 1 · Entity resolution
            </h4>
            {candidates.length === 0 && <p className="text-xs text-white/50">No duplicate candidates found 🎉</p>}
            <div className="space-y-2">
              {candidates.map((c) => (
                <label key={c.canonical} className={`flex cursor-pointer gap-2 rounded-xl border p-2 text-xs ${applied.has(c.canonical) ? "border-emerald-400/60 bg-emerald-500/10" : "border-white/10"}`}>
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-emerald-500"
                    checked={applied.has(c.canonical)}
                    onChange={() => {
                      const n = new Set(applied);
                      if (n.has(c.canonical)) n.delete(c.canonical);
                      else n.add(c.canonical);
                      setApplied(n);
                    }}
                  />
                  <div>
                    <div>
                      {c.variants.map((v) => (
                        <span key={v} className="mr-1 rounded bg-white/10 px-1 font-mono">
                          {v}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1">
                      → <b className="text-emerald-300">{c.canonical}</b>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {candidates.length > 0 && (
              <button onClick={() => setApplied(new Set(candidates.map((c) => c.canonical)))} className="mt-2 w-full rounded-lg bg-gradient-to-r from-amber-500 to-red-500 py-1.5 text-xs font-semibold">
                Merge all
              </button>
            )}
          </div>
          <div className="glass rounded-2xl p-4">
            <h4 className="mb-2 font-bold">Step 2 · Validation</h4>
            {validation.length === 0 ? (
              <p className="flex items-center gap-1 text-xs text-emerald-300">
                <CheckCircle2 size={14} /> All checks pass
              </p>
            ) : (
              <div className="space-y-1">
                {validation.map((v, i) => (
                  <div key={i} className={`flex gap-1.5 text-[11px] ${v.level === "error" ? "text-rose-300" : "text-amber-200"}`}>
                    <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {v.msg}
                  </div>
                ))}
                <p className="pt-1 text-[10px] text-white/45">Self-loops are dropped from the final graph. Merging also normalises relationship names.</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <GraphCanvas data={after} height={440} showEdgeLabels="always" />
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <h4 className="mb-2 font-bold">Step 3 · Store in Neo4j</h4>
        <CodeTabs
          samples={[
            { title: "load.cypher", lang: "cypher", code: toCypher(valid) },
            {
              title: "load.py",
              lang: "python",
              code: `from neo4j import GraphDatabase\n\ntriples = ${JSON.stringify(valid.slice(0, 3), null, 2).replace(/\n/g, "\n")}  # ...\n\ndef load(tx, t):\n    tx.run(f"""\n      MERGE (a:{t['subject_type']} {{name: $s}})\n      MERGE (b:{t['object_type']} {{name: $o}})\n      MERGE (a)-[:{t['relation']}]->(b)""", s=t["subject"], o=t["object"])\n\nwith driver.session(database="neo4j") as session:\n    for t in triples:\n        session.execute_write(load, t)`,
            },
          ]}
        />
      </div>
    </div>
  );
}
