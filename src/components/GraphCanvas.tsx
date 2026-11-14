"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { Maximize2, RotateCcw } from "lucide-react";
import { colorFor, GraphData, KGNode } from "@/lib/kg/types";

type SimNode = SimulationNodeDatum & { id: string; node: KGNode; r: number };
type SimLink = SimulationLinkDatum<SimNode> & { id: string; type: string };

export interface GraphCanvasProps {
  data: GraphData;
  height?: number;
  highlight?: { nodes: string[]; edges: string[] } | null;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  nodeColor?: (n: KGNode) => string;
  showEdgeLabels?: "always" | "highlight" | "hover";
  legend?: boolean;
  className?: string;
}

export default function GraphCanvas({
  data,
  height = 460,
  highlight,
  selected,
  onSelect,
  nodeColor,
  showEdgeLabels = "highlight",
  legend = true,
  className = "",
}: GraphCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [frame, setFrame] = useState<{ nodes: SimNode[]; links: SimLink[] }>({ nodes: [], links: [] });
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const dragRef = useRef<{ id?: string; panX?: number; panY?: number; sx: number; sy: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const degree = useMemo(() => {
    const d = new Map<string, number>();
    data.edges.forEach((e) => {
      d.set(e.source, (d.get(e.source) ?? 0) + 1);
      d.set(e.target, (d.get(e.target) ?? 0) + 1);
    });
    return d;
  }, [data]);

  // (re)build simulation when the graph changes, preserving existing positions
  useEffect(() => {
    const prev = new Map(nodesRef.current.map((n) => [n.id, n]));
    const nodes: SimNode[] = data.nodes.map((n) => {
      const p = prev.get(n.id);
      const r = 7 + Math.min(10, Math.sqrt(degree.get(n.id) ?? 0) * 2.6);
      return p ? Object.assign(p, { node: n, r }) : { id: n.id, node: n, r, x: width / 2 + (Math.random() - 0.5) * 80, y: height / 2 + (Math.random() - 0.5) * 80 };
    });
    const ids = new Set(nodes.map((n) => n.id));
    const links: SimLink[] = data.edges
      .filter((e) => ids.has(e.source) && ids.has(e.target))
      .map((e) => ({ id: e.id, source: e.source, target: e.target, type: e.type }));
    nodesRef.current = nodes;
    linksRef.current = links;
    setFrame({ nodes: [...nodes], links: [...links] });
    simRef.current?.stop();
    const small = nodes.length < 25;
    const sim = forceSimulation<SimNode>(nodes)
      .force("link", forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(small ? 95 : 70).strength(0.5))
      .force("charge", forceManyBody().strength(small ? -380 : -220))
      .force("center", forceCenter(width / 2, height / 2))
      .force("x", forceX(width / 2).strength(0.05))
      .force("y", forceY(height / 2).strength(0.08))
      .force("collide", forceCollide<SimNode>().radius((d) => d.r + 10))
      .alpha(prev.size ? 0.5 : 1);
    let raf = 0;
    sim.on("tick", () => {
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        // fresh arrays each frame so React re-renders the mutated d3 positions
        setFrame({ nodes: [...nodes], links: [...links] });
      });
    });
    simRef.current = sim;
    return () => {
      sim.stop();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, degree]);

  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    (sim.force("center") as ReturnType<typeof forceCenter>)?.x(width / 2).y(height / 2);
    (sim.force("x") as ReturnType<typeof forceX>)?.x(width / 2);
    (sim.force("y") as ReturnType<typeof forceY>)?.y(height / 2);
    sim.alpha(0.3).restart();
  }, [width, height]);

  const hlNodes = useMemo(() => new Set(highlight?.nodes ?? []), [highlight]);
  const hlEdges = useMemo(() => new Set(highlight?.edges ?? []), [highlight]);
  const active = hlNodes.size > 0 || hlEdges.size > 0;

  const focus = hover ?? selected ?? null;
  const focusSet = useMemo(() => {
    if (!focus) return null;
    const s = new Set([focus]);
    data.edges.forEach((e) => {
      if (e.source === focus) s.add(e.target);
      if (e.target === focus) s.add(e.source);
    });
    return s;
  }, [focus, data]);

  const toGraph = (clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return { x: (clientX - rect.left - view.x) / view.k, y: (clientY - rect.top - view.y) / view.k };
  };

  const onPointerDownNode = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, moved: false };
    simRef.current?.alphaTarget(0.3).restart();
  };
  const onPointerDownBg = (e: React.PointerEvent) => {
    dragRef.current = { panX: view.x, panY: view.y, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 3) d.moved = true;
    if (d.id) {
      const n = nodesRef.current.find((n) => n.id === d.id);
      if (n) {
        const p = toGraph(e.clientX, e.clientY);
        n.fx = p.x;
        n.fy = p.y;
      }
    } else if (d.panX !== undefined) {
      setView((v) => ({ ...v, x: d.panX! + (e.clientX - d.sx), y: d.panY! + (e.clientY - d.sy) }));
    }
  };
  const onPointerUp = () => {
    const d = dragRef.current;
    if (d?.id) {
      const n = nodesRef.current.find((n) => n.id === d.id);
      if (n) {
        n.fx = null;
        n.fy = null;
      }
      simRef.current?.alphaTarget(0);
      if (!d.moved) onSelect?.(selected === d.id ? null : d.id);
    } else if (d && !d.moved) onSelect?.(null);
    dragRef.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey && !e.altKey) return; // don't hijack page scroll
    e.preventDefault();
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setView((v) => {
      const k = Math.min(3, Math.max(0.3, v.k * (e.deltaY < 0 ? 1.12 : 0.89)));
      return { k, x: mx - ((mx - v.x) * k) / v.k, y: my - ((my - v.y) * k) / v.k };
    });
  };
  const zoom = (f: number) =>
    setView((v) => {
      const k = Math.min(3, Math.max(0.3, v.k * f));
      return { k, x: width / 2 - ((width / 2 - v.x) * k) / v.k, y: height / 2 - ((height / 2 - v.y) * k) / v.k };
    });

  const { nodes, links } = frame;
  const labels = [...new Set(data.nodes.map((n) => n.label))];
  const hovered = hover ? nodes.find((n) => n.id === hover) : null;
  const col = (n: KGNode) => (nodeColor ? nodeColor(n) : colorFor(n.label));

  return (
    <div ref={wrapRef} className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0820]/80 ${className}`} style={{ height }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.12),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.10),transparent_50%)]" />
      <svg
        width={width}
        height={height}
        className="relative touch-none select-none"
        onPointerDown={onPointerDownBg}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <defs>
          <marker id="arrow" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,-5L10,0L0,5" fill="rgba(255,255,255,0.45)" />
          </marker>
          <marker id="arrow-hl" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,-5L10,0L0,5" fill="#fde047" />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          {links.map((l) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            if (s.x == null || t.x == null) return null;
            const isHl = hlEdges.has(l.id);
            const inFocus = focusSet && focusSet.has(s.id) && focusSet.has(t.id) && (s.id === focus || t.id === focus);
            const dim = (active && !isHl) || (focusSet && !inFocus);
            const dx = t.x! - s.x!;
            const dy = t.y! - s.y!;
            const len = Math.hypot(dx, dy) || 1;
            const x2 = t.x! - (dx / len) * (t.r + 3);
            const y2 = t.y! - (dy / len) * (t.r + 3);
            const showLabel = showEdgeLabels === "always" || (showEdgeLabels === "highlight" && (isHl || inFocus)) || inFocus;
            return (
              <g key={l.id} opacity={dim ? 0.12 : 1}>
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={x2}
                  y2={y2}
                  stroke={isHl ? "#fde047" : inFocus ? "#e9d5ff" : "rgba(255,255,255,0.28)"}
                  strokeWidth={isHl ? 2.4 : 1.2}
                  markerEnd={isHl ? "url(#arrow-hl)" : "url(#arrow)"}
                  className={isHl ? "edge-flow" : ""}
                />
                {showLabel && (
                  <text
                    x={(s.x! + t.x!) / 2}
                    y={(s.y! + t.y!) / 2 - 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill={isHl ? "#fef08a" : "#ddd6fe"}
                    className="font-mono"
                    style={{ paintOrder: "stroke", stroke: "#0b0820", strokeWidth: 3 }}
                  >
                    {l.type}
                  </text>
                )}
              </g>
            );
          })}
          {nodes.map((n) => {
            if (n.x == null) return null;
            const isHl = hlNodes.has(n.id);
            const dim = (active && !isHl) || (focusSet && !focusSet.has(n.id));
            const c = col(n.node);
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                opacity={dim ? 0.18 : 1}
                onPointerDown={(e) => onPointerDownNode(e, n.id)}
                onPointerEnter={() => setHover(n.id)}
                onPointerLeave={() => setHover(null)}
                className="cursor-pointer"
              >
                {(isHl || selected === n.id) && <circle r={n.r + 7} fill={c} opacity={0.35} filter="url(#glow)" className="pulse-ring" />}
                <circle r={n.r} fill={c} stroke={selected === n.id ? "#fff" : "rgba(255,255,255,0.6)"} strokeWidth={selected === n.id ? 2.5 : 1} />
                <text
                  y={n.r + 12}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill="#f5f3ff"
                  fontWeight={isHl ? 700 : 500}
                  style={{ paintOrder: "stroke", stroke: "#0b0820", strokeWidth: 3 }}
                >
                  {n.node.name.length > 22 ? n.node.name.slice(0, 21) + "…" : n.node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && hovered.x != null && (
        <div
          className="pointer-events-none absolute z-10 max-w-[260px] rounded-xl border border-white/15 bg-slate-950/95 p-3 text-xs shadow-xl"
          style={{
            left: Math.min(width - 270, hovered.x! * view.k + view.x + 14),
            top: Math.min(height - 120, hovered.y! * view.k + view.y + 10),
          }}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: col(hovered.node) }} />
            <span className="font-semibold">{hovered.node.name}</span>
            <span className="rounded bg-white/10 px-1.5 text-[10px] text-white/70">:{hovered.node.label}</span>
          </div>
          {Object.entries(hovered.node.props)
            .filter(([k]) => k !== "name")
            .slice(0, 5)
            .map(([k, v]) => (
              <div key={k} className="text-white/70">
                <span className="text-fuchsia-300">{k}</span>: {String(v)}
              </div>
            ))}
        </div>
      )}

      {legend && (
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {labels.map((l) => (
            <span key={l} className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full" style={{ background: colorFor(l) }} />
              {l}
            </span>
          ))}
        </div>
      )}
      <div className="absolute bottom-3 right-3 flex gap-1">
        <button onClick={() => zoom(1.2)} className="rounded-lg bg-black/50 px-2 py-1 text-xs hover:bg-white/10" aria-label="Zoom in">
          +
        </button>
        <button onClick={() => zoom(0.83)} className="rounded-lg bg-black/50 px-2 py-1 text-xs hover:bg-white/10" aria-label="Zoom out">
          −
        </button>
        <button onClick={() => setView({ x: 0, y: 0, k: 1 })} className="rounded-lg bg-black/50 px-2 py-1 hover:bg-white/10" aria-label="Reset view">
          <Maximize2 size={12} />
        </button>
        <button onClick={() => simRef.current?.alpha(1).restart()} className="rounded-lg bg-black/50 px-2 py-1 hover:bg-white/10" aria-label="Re-layout">
          <RotateCcw size={12} />
        </button>
      </div>
      <div className="absolute bottom-3 left-3 text-[10px] text-white/40">drag nodes · drag to pan · ctrl/⌘+scroll to zoom · click to focus</div>
    </div>
  );
}
