"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Loader2, RotateCcw, Sparkles } from "lucide-react";
import GraphCanvas from "../GraphCanvas";
import { useGroq } from "../KeyProvider";
import { Graph } from "@/lib/kg/graph";
import { ENTERPRISE_KG } from "@/lib/kg/data";
import { graphRetrieve, vectorSearch } from "@/lib/kg/retrieval";

const QUESTIONS = [
  "Which technologies are used by projects that Priya Sharma works on?",
  "What skills does the team on Enterprise Copilot have?",
  "How is Zara Ali connected to Neo4j?",
  "Which projects does Ravi Kumar work on and what do they use?",
  "Who in AI Research knows Agentic AI?",
];

export default function Lab5Retrieval() {
  const g = useMemo(() => new Graph(ENTERPRISE_KG), []);
  const { apiKey, model, hasKey, openSettings } = useGroq();
  const [q, setQ] = useState(QUESTIONS[0]);
  const [k, setK] = useState(3);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ v?: string; g?: string; busy?: boolean; err?: string }>({});

  const vec = useMemo(() => vectorSearch(q, k), [q, k]);
  const gr = useMemo(() => graphRetrieve(g, q, 2), [g, q]);
  const s = gr.steps[Math.min(step, gr.steps.length - 1)];
  const vecContext = vec.map((d) => `[${d.title}] ${d.text}`).join("\n");
  const graphContext = gr.facts.join("\n");

  async function askBoth() {
    if (!hasKey) return openSettings();
    setAnswers({ busy: true });
    const call = (context: string) =>
      fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-groq-key": apiKey },
        body: JSON.stringify({ question: q, context, model }),
      }).then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        return j.answer as string;
      });
    try {
      const [v, gg] = await Promise.all([call(vecContext), call(graphContext)]);
      setAnswers({ v, g: gg });
    } catch (e) {
      setAnswers({ err: (e as Error).message });
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUESTIONS.map((x) => (
            <button
              key={x}
              onClick={() => {
                setQ(x);
                setStep(0);
                setAnswers({});
              }}
              className={`rounded-full border px-3 py-1 text-xs ${q === x ? "border-sky-400 bg-sky-500/20" : "border-white/10 hover:border-white/30"}`}
            >
              {x}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setStep(0);
            setAnswers({});
          }}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        {/* vector */}
        <div className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-cyan-300">A · Vector-style retrieval (top-{k} chunks)</h4>
            <select value={k} onChange={(e) => setK(Number(e.target.value))} className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs">
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n} className="bg-slate-900">
                  k={n}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            {vec.map((d, i) => (
              <div key={d.id} className="fade-up rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold">{d.title}</span>
                  <span className="rounded-full bg-cyan-400/20 px-2 font-mono text-cyan-200">cos {d.score}</span>
                </div>
                <div className="mb-1 h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" style={{ width: `${Math.min(100, d.score * 100)}%` }} />
                </div>
                <p className="text-[11.5px] text-white/65">{d.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-white/45">TF-IDF cosine similarity as a transparent stand-in for embeddings. Same idea: rank chunks by similarity to the question.</p>
        </div>

        {/* graph */}
        <div className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-bold text-pink-300">B · Graph retrieval, step by step</h4>
            <div className="flex gap-1.5">
              <button onClick={() => setStep(0)} className="rounded-lg border border-white/15 p-1.5 hover:bg-white/10" aria-label="Restart">
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => setStep((x) => Math.min(gr.steps.length - 1, x + 1))}
                disabled={step >= gr.steps.length - 1}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-1 text-xs font-semibold disabled:opacity-40"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
          <div className="mb-2 flex gap-1">
            {gr.steps.map((x, i) => (
              <button key={i} onClick={() => setStep(i)} className={`flex-1 rounded-md py-1 text-[10px] font-semibold ${i <= step ? "bg-pink-500/40" : "bg-white/5 text-white/40"}`}>
                {x.title}
              </button>
            ))}
          </div>
          <GraphCanvas data={ENTERPRISE_KG} height={330} highlight={{ nodes: s.nodes, edges: s.edges }} legend={false} />
          <div className="mt-2 max-h-36 overflow-y-auto rounded-xl bg-black/30 p-2 font-mono text-[10.5px] text-pink-100">
            {s.detail.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-bold">C · Compare what the LLM would receive</h4>
          <button onClick={askBoth} disabled={answers.busy} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {answers.busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {hasKey ? "Ask Groq with both contexts" : "Add Groq key to compare answers"}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-cyan-300">Vector context · {vecContext.length} chars</div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-[11px] text-white/70">{vecContext}</pre>
            {answers.v && <div className="mt-2 whitespace-pre-wrap rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm">{answers.v}</div>}
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-pink-300">
              Graph context · {gr.facts.length} facts · {graphContext.length} chars
            </div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 font-mono text-[10.5px] text-white/70">{graphContext || "(no entities linked: try naming a person, project or technology)"}</pre>
            {answers.g && <div className="mt-2 whitespace-pre-wrap rounded-xl border border-pink-400/30 bg-pink-500/10 p-3 text-sm">{answers.g}</div>}
          </div>
        </div>
        {answers.err && <p className="mt-2 text-sm text-rose-300">⚠ {answers.err}</p>}
        <p className="mt-3 text-xs text-white/50">
          Discussion: which context contains every fact the question needs? Which one would scale better to 10,000 documents? Production systems combine both (Module 6.1).
        </p>
      </div>
    </div>
  );
}
