"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import GraphCanvas from "./GraphCanvas";
import { Graph } from "@/lib/kg/graph";
import { ENTERPRISE_KG } from "@/lib/kg/data";
import { colorFor, GraphData } from "@/lib/kg/types";
import { PALETTE } from "./visuals/Primitives";

export default function KGExplorer({ height = 540, data = ENTERPRISE_KG }: { height?: number; data?: GraphData }) {
  const full = useMemo(() => new Graph(data), [data]);
  const labels = useMemo(() => [...new Set(data.nodes.map((n) => n.label))], [data]);
  const [on, setOn] = useState<Set<string>>(new Set(labels));
  const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [communityMode, setCommunityMode] = useState(false);
  const comm = useMemo(() => full.communities(), [full]);

  const filtered: GraphData = useMemo(() => {
    const nodes = data.nodes.filter((n) => on.has(n.label));
    const ids = new Set(nodes.map((n) => n.id));
    return { nodes, edges: data.edges.filter((e) => ids.has(e.source) && ids.has(e.target)) };
  }, [data, on]);

  const searchHits = q.trim() ? full.search(q, undefined, 6) : [];
  const node = sel ? full.nodes.get(sel) : null;
  const nb = sel ? full.neighbors(sel) : [];

  const stats = labels.map((l) => ({ l, c: data.nodes.filter((n) => n.label === l).length }));

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {stats.map(({ l, c }) => (
            <button
              key={l}
              onClick={() => {
                const n = new Set(on);
                if (n.has(l)) n.delete(l);
                else n.add(l);
                setOn(n);
              }}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${on.has(l) ? "border-white/25 bg-white/10" : "border-white/5 opacity-40"}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorFor(l) }} />
              {l} <span className="text-white/50">{c}</span>
            </button>
          ))}
          <button
            onClick={() => setCommunityMode((m) => !m)}
            className={`ml-auto rounded-full border px-3 py-1 text-xs ${communityMode ? "border-fuchsia-400 bg-fuchsia-500/20" : "border-white/15"}`}
          >
            🎨 Colour by community
          </button>
        </div>
        <GraphCanvas
          data={filtered}
          height={height}
          selected={sel}
          onSelect={setSel}
          legend={!communityMode}
          nodeColor={communityMode ? (n) => PALETTE[(comm.get(n.id) ?? 0) % PALETTE.length] : undefined}
        />
      </div>
      <aside className="glass flex flex-col gap-3 rounded-2xl p-4" style={{ maxHeight: height + 40 }}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find an entity…"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-8 pr-3 text-sm outline-none focus:border-fuchsia-400"
          />
          {searchHits.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
              {searchHits.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setSel(h.id);
                    setQ("");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/10"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: colorFor(h.label) }} />
                  {h.name} <span className="ml-auto text-[10px] text-white/40">{h.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {!node && (
          <div className="space-y-3 text-sm text-white/60">
            <p>Click any node to inspect its properties and relationships.</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <div className="text-2xl font-bold text-fuchsia-300">{data.nodes.length}</div>
                <div className="text-[11px]">nodes</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <div className="text-2xl font-bold text-cyan-300">{data.edges.length}</div>
                <div className="text-[11px]">relationships</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <div className="text-2xl font-bold text-amber-300">{labels.length}</div>
                <div className="text-[11px]">labels</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center">
                <div className="text-2xl font-bold text-emerald-300">{new Set(data.edges.map((e) => e.type)).size}</div>
                <div className="text-[11px]">rel types</div>
              </div>
            </div>
          </div>
        )}
        {node && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: colorFor(node.label) }} />
              <h4 className="font-bold">{node.name}</h4>
            </div>
            <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px]">:{node.label}</span>
            <div className="mt-3 space-y-1 rounded-xl bg-black/30 p-3 font-mono text-[11px]">
              {Object.entries(node.props).map(([k, v]) => (
                <div key={k}>
                  <span className="text-fuchsia-300">{k}</span>: <span className="text-emerald-200">{JSON.stringify(v)}</span>
                </div>
              ))}
            </div>
            <h5 className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wider text-white/50">Relationships ({nb.length})</h5>
            <div className="space-y-1">
              {nb.map(({ edge, node: o, dir }) => (
                <button
                  key={edge.id}
                  onClick={() => setSel(o.id)}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-xs hover:bg-white/10"
                >
                  <span className="font-mono text-[10px] text-cyan-300">
                    {dir === "out" ? "→" : "←"} {edge.type}
                  </span>
                  <span className="truncate">{o.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
