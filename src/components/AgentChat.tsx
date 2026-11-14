"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, ChevronDown, Loader2, Send, Square, Trash2, User, Wrench, Workflow } from "lucide-react";
import GraphCanvas from "./GraphCanvas";
import { KeyGate, useGroq } from "./KeyProvider";
import { streamNDJSON } from "@/lib/client/stream";
import { ENTERPRISE_KG } from "@/lib/kg/data";

interface TraceItem {
  kind: "step" | "call" | "result";
  label: string;
  body?: string;
}
interface Turn {
  role: "user" | "assistant";
  content: string;
  trace?: TraceItem[];
  cypher?: string[];
  ms?: number;
  error?: string;
  highlight?: { nodes: string[]; edges: string[] };
}

export default function AgentChat({
  mode,
  samples,
  initialQuestion,
  title,
}: {
  mode: "kg" | "tutor";
  samples: string[];
  initialQuestion?: string;
  title: string;
}) {
  const { apiKey, model } = useGroq();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState(initialQuestion ?? "");
  const [busy, setBusy] = useState(false);
  const [hl, setHl] = useState<{ nodes: string[]; edges: string[] } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns]);

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    const history = [...turns.filter((t) => !t.error).map((t) => ({ role: t.role, content: t.content })), { role: "user", content: q }];
    const assistant: Turn = { role: "assistant", content: "", trace: [] };
    setTurns((t) => [...t, { role: "user", content: q }, assistant]);
    setInput("");
    setBusy(true);
    setHl(null);
    const ac = new AbortController();
    abortRef.current = ac;
    const patch = (fn: (a: Turn) => Turn) =>
      setTurns((ts) => {
        const copy = [...ts];
        copy[copy.length - 1] = fn({ ...copy[copy.length - 1] });
        return copy;
      });
    try {
      await streamNDJSON(
        "/api/agent",
        { messages: history, model, mode },
        apiKey,
        (e) => {
          if (e.type === "step") {
            const detail = (e.detail as string[]) ?? [];
            patch((a) => ({ ...a, trace: [...(a.trace ?? []), { kind: "step", label: `${e.node} · ${e.label}`, body: detail.length ? detail.join(", ") : undefined }] }));
          } else if (e.type === "tool_call") {
            patch((a) => ({ ...a, trace: [...(a.trace ?? []), { kind: "call", label: String(e.name), body: JSON.stringify(e.args, null, 2) }] }));
          } else if (e.type === "tool_result") {
            patch((a) => ({ ...a, trace: [...(a.trace ?? []), { kind: "result", label: `${e.name} → result`, body: String(e.content) }] }));
          } else if (e.type === "highlight") {
            const h = { nodes: e.nodes as string[], edges: e.edges as string[] };
            setHl(h);
            patch((a) => ({ ...a, highlight: h }));
          } else if (e.type === "final") {
            patch((a) => ({ ...a, content: String(e.content || "_(no answer)_"), cypher: e.cypher as string[], ms: e.ms as number }));
          } else if (e.type === "error") {
            patch((a) => ({ ...a, error: String(e.message) }));
          }
        },
        ac.signal,
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") patch((a) => ({ ...a, error: (err as Error).message }));
      else patch((a) => ({ ...a, error: "Stopped." }));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <KeyGate feature={title}>
      <div className={`grid gap-4 ${mode === "kg" ? "xl:grid-cols-[1fr_1fr]" : "xl:grid-cols-[1.2fr_1fr]"}`}>
        {/* chat */}
        <div className="glass flex h-[680px] flex-col rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 p-1.5">
                <Bot size={18} />
              </div>
              <div>
                <div className="text-sm font-bold">{title}</div>
                <div className="text-[10px] text-white/50">LangGraph.js · ChatGroq · {model}</div>
              </div>
            </div>
            {turns.length > 0 && (
              <button
                onClick={() => {
                  setTurns([]);
                  setHl(null);
                }}
                className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Clear chat"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {turns.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-white/60">Try one of these:</p>
                {samples.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm transition hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {turns.map((t, i) => (
              <div key={i} className={`flex gap-2 ${t.role === "user" ? "justify-end" : ""}`}>
                {t.role === "assistant" && (
                  <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 p-1.5">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${t.role === "user" ? "bg-gradient-to-r from-fuchsia-600 to-violet-600" : "bg-white/5"}`}>
                  {t.role === "assistant" && t.trace && t.trace.length > 0 && (
                    <details className="mb-2 rounded-xl bg-black/30 text-xs" open={!t.content && !t.error}>
                      <summary className="flex cursor-pointer items-center gap-1.5 px-3 py-2 text-white/70">
                        <Workflow size={13} className="text-fuchsia-300" /> Agent trace · {t.trace.length} events
                        {t.ms ? ` · ${(t.ms / 1000).toFixed(1)}s` : ""}
                        <ChevronDown size={12} />
                      </summary>
                      <div className="space-y-1.5 px-3 pb-3">
                        {t.trace.map((x, j) => (
                          <div key={j} className={`rounded-lg border-l-2 py-1 pl-2 ${x.kind === "step" ? "border-fuchsia-400" : x.kind === "call" ? "border-amber-400" : "border-emerald-400"}`}>
                            <div className="flex items-center gap-1 font-semibold">
                              {x.kind === "call" && <Wrench size={11} className="text-amber-300" />}
                              <span className={x.kind === "step" ? "text-fuchsia-200" : x.kind === "call" ? "text-amber-200" : "text-emerald-200"}>{x.label}</span>
                            </div>
                            {x.body && <pre className="mt-0.5 max-h-36 overflow-auto whitespace-pre-wrap break-words font-mono text-[10.5px] text-white/60">{x.body}</pre>}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  {t.role === "assistant" && !t.content && !t.error && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Loader2 size={14} className="animate-spin" /> thinking with the graph…
                    </div>
                  )}
                  {t.content && (
                    <div className="prose-chat">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{t.content}</ReactMarkdown>
                    </div>
                  )}
                  {t.error && <div className="text-rose-300">⚠ {t.error}</div>}
                  {t.highlight && t.highlight.nodes.length > 0 && t.content && (
                    <button onClick={() => setHl(t.highlight!)} className="mt-2 text-[11px] text-cyan-300 hover:underline">
                      ↗ show this answer&apos;s subgraph ({t.highlight.nodes.length} nodes)
                    </button>
                  )}
                </div>
                {t.role === "user" && (
                  <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-white/10 p-1.5">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t border-white/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "kg" ? "Ask about NovaTech's people, projects & tech…" : "Ask anything about Knowledge Graphs & Graph RAG…"}
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none focus:border-fuchsia-400"
            />
            {busy ? (
              <button type="button" onClick={() => abortRef.current?.abort()} className="rounded-xl bg-rose-500/80 px-4" aria-label="Stop">
                <Square size={16} />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-400 px-4 disabled:opacity-40" aria-label="Send">
                <Send size={16} />
              </button>
            )}
          </form>
        </div>

        {/* graph */}
        <div className="space-y-3">
          <div className="glass rounded-3xl p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="text-sm font-semibold">Knowledge graph evidence</div>
              <div className="text-[11px] text-white/50">{hl?.nodes.length ? `${hl.nodes.length} nodes · ${hl.edges.length} relationships used` : "Lights up as the agent retrieves"}</div>
            </div>
            <GraphCanvas data={ENTERPRISE_KG} height={mode === "kg" ? 470 : 420} highlight={hl} />
          </div>
          <div className="glass rounded-3xl p-4 text-xs text-white/60">
            <div className="mb-2 font-semibold text-white/80">How this agent works (LangGraph StateGraph)</div>
            <div className="flex flex-wrap items-center gap-1.5 font-mono">
              {["START", "link_entities", "agent", "⇄ tools", "END"].map((n, i) => (
                <span key={n} className="flex items-center gap-1.5">
                  <span className="rounded-md px-2 py-0.5" style={{ background: ["#64748b", "#f472b6", "#c084fc", "#34d399", "#64748b"][i] + "33" }}>
                    {n}
                  </span>
                  {i < 4 && <span className="text-white/30">→</span>}
                </span>
              ))}
            </div>
            <p className="mt-2">
              Tools: <code>search_entities</code>, <code>get_neighbors</code>, <code>find_paths</code>, <code>run_cypher</code>
              {mode === "tutor" && (
                <>
                  , <code>search_course</code>
                </>
              )}
              . The Cypher tool is read-only.
            </p>
          </div>
        </div>
      </div>
    </KeyGate>
  );
}
