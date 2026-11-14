"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, Play } from "lucide-react";
import GraphCanvas from "../GraphCanvas";
import { KeyGate, useGroq } from "../KeyProvider";
import { triplesToGraph } from "../visuals/CustomB";
import { streamNDJSON } from "@/lib/client/stream";
import { colorFor } from "@/lib/kg/types";
import type { T } from "./Lab1Builder";

const SAMPLES = [
  {
    name: "Course example",
    text: "John works at Microsoft as an AI Engineer. He uses Python and LangChain to develop intelligent applications.",
  },
  {
    name: "Org announcement",
    text: "NovaTech Labs today announced that Priya Sharma will lead the new Agentic AI Center of Excellence in Bengaluru. Priya previously built the Knowledge Graph Assistant with Ravi Kumar, which runs on Neo4j and LangGraph. The center will partner with Stanford University and report to CTO Marcus Lee.",
  },
  {
    name: "Incident report",
    text: "On March 3, the Payments API experienced an outage. The root cause was a memory leak in the Auth Service, which depends on Redis Cluster B. The on-call engineer, Liam O'Brien, rolled back release v2.14 and the Payments API recovered at 14:20 UTC.",
  },
  {
    name: "Healthcare",
    text: "Metformin is a first-line medication for type 2 diabetes. It acts on the liver by inhibiting gluconeogenesis. Common side effects include nausea, and it is contraindicated in patients with severe kidney disease.",
  },
];

type StepState = "idle" | "running" | "done";

export default function Lab3Extract() {
  const { apiKey, model } = useGroq();
  const router = useRouter();
  const [text, setText] = useState(SAMPLES[0].text);
  const [types, setTypes] = useState("Person, Organization, Role, Technology, Concept, Location, Project");
  const [steps, setSteps] = useState<Record<string, { s: StepState; info?: string }>>({});
  const [triples, setTriples] = useState<T[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [ms, setMs] = useState(0);

  async function run() {
    setBusy(true);
    setErr("");
    setTriples([]);
    setIssues([]);
    setSteps({ extract: { s: "running" } });
    try {
      await streamNDJSON("/api/extract", { text, model, allowedTypes: types }, apiKey, (e) => {
        if (e.type === "step") {
          const node = String(e.node);
          const next = node === "extract" ? "normalize" : node === "normalize" ? "validate" : null;
          setSteps((s) => ({
            ...s,
            [node]: { s: "done", info: node === "extract" ? `${e.count} raw triples (attempt ${e.attempt})` : node === "normalize" ? `${e.count} normalised` : `${e.count} valid` },
            ...(next ? { [next]: { s: "running" } } : {}),
          }));
          if (node === "validate" && Number(e.count) === 0) setSteps((s) => ({ ...s, extract: { s: "running", info: "retrying…" } }));
        }
        if (e.type === "final") {
          setTriples(e.triples as T[]);
          setIssues(e.issues as string[]);
          setMs(e.ms as number);
        }
        if (e.type === "error") setErr(String(e.message));
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const nodeBox = (id: string, title: string, desc: string, c: string) => {
    const st = steps[id]?.s ?? "idle";
    return (
      <div className={`flex-1 rounded-xl border p-3 transition ${st === "running" ? "animate-pulse" : ""}`} style={{ borderColor: st === "idle" ? "rgba(255,255,255,0.1)" : c, background: st === "idle" ? "transparent" : c + "1f" }}>
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold" style={{ color: st === "idle" ? "rgba(255,255,255,0.5)" : c }}>
          {st === "running" && <Loader2 size={13} className="animate-spin" />}
          {st === "done" && <CheckCircle2 size={13} />}
          {title}
        </div>
        <div className="text-[11px] text-white/55">{desc}</div>
        {steps[id]?.info && <div className="mt-1 text-[11px] font-semibold text-white/80">{steps[id]!.info}</div>}
      </div>
    );
  };

  return (
    <KeyGate feature="LLM extraction">
      <div className="space-y-4">
        <div className="glass rounded-2xl p-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SAMPLES.map((s) => (
              <button key={s.name} onClick={() => setText(s.text)} className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-pink-400/60">
                {s.name}
              </button>
            ))}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-pink-400" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-xs text-white/60">Allowed entity types:</label>
            <input value={types} onChange={(e) => setTypes(e.target.value)} className="min-w-[260px] flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs outline-none" />
            <button
              onClick={run}
              disabled={busy || !text.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run LangGraph pipeline
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">LangGraph StateGraph: live trace</div>
          <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
            {nodeBox("extract", "extract", "ChatGroq + structured output (zod schema)", "#f472b6")}
            <ArrowRight className="mx-auto shrink-0 rotate-90 text-white/30 md:rotate-0" size={16} />
            {nodeBox("normalize", "normalize", "canonical names, PascalCase types, UPPER_SNAKE relations, coreference merge", "#fbbf24")}
            <ArrowRight className="mx-auto shrink-0 rotate-90 text-white/30 md:rotate-0" size={16} />
            {nodeBox("validate", "validate", "drop self-loops, empties, duplicates; if 0 valid → retry extract", "#34d399")}
          </div>
          {err && <p className="mt-3 text-sm text-rose-300">⚠ {err}</p>}
        </div>

        {triples.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-bold">
                  {triples.length} triples <span className="text-xs font-normal text-white/50">in {(ms / 1000).toFixed(1)}s</span>
                </h4>
                <button
                  onClick={() => {
                    try {
                      sessionStorage.setItem("lab3_triples", JSON.stringify(triples));
                    } catch {}
                    router.push("/labs/4?from=lab3");
                  }}
                  className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-red-500 px-3 py-1.5 text-xs font-semibold"
                >
                  Send to Lab 4 <ArrowRight size={12} />
                </button>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-white/50">
                    <th className="pb-1">Subject</th>
                    <th className="pb-1">Relationship</th>
                    <th className="pb-1">Object</th>
                  </tr>
                </thead>
                <tbody>
                  {triples.map((t, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="py-1.5">
                        <span style={{ color: colorFor(t.subject_type) }}>{t.subject}</span>
                        <span className="ml-1 text-[9px] text-white/40">:{t.subject_type}</span>
                      </td>
                      <td className="py-1.5 font-mono text-cyan-300">{t.relation}</td>
                      <td className="py-1.5">
                        <span style={{ color: colorFor(t.object_type) }}>{t.object}</span>
                        <span className="ml-1 text-[9px] text-white/40">:{t.object_type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {issues.length > 0 && (
                <div className="mt-3 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-200">
                  <b>Validation notes:</b>
                  {issues.map((x, i) => (
                    <div key={i}>• {x}</div>
                  ))}
                </div>
              )}
            </div>
            <GraphCanvas data={triplesToGraph(triples)} height={420} showEdgeLabels="always" />
          </div>
        )}
      </div>
    </KeyGate>
  );
}
