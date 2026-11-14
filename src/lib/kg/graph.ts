import { GraphData, KGEdge, KGNode } from "./types";

export class Graph {
  nodes: Map<string, KGNode> = new Map();
  edges: KGEdge[] = [];
  out: Map<string, KGEdge[]> = new Map();
  inc: Map<string, KGEdge[]> = new Map();

  constructor(data: GraphData) {
    data.nodes.forEach((n) => this.nodes.set(n.id, n));
    data.edges.forEach((e) => this.addEdgeIndex(e));
  }

  private addEdgeIndex(e: KGEdge) {
    this.edges.push(e);
    if (!this.out.has(e.source)) this.out.set(e.source, []);
    if (!this.inc.has(e.target)) this.inc.set(e.target, []);
    this.out.get(e.source)!.push(e);
    this.inc.get(e.target)!.push(e);
  }

  outgoing(id: string) {
    return this.out.get(id) ?? [];
  }
  incoming(id: string) {
    return this.inc.get(id) ?? [];
  }

  /** Fuzzy entity lookup: exact > startsWith > contains > token overlap. */
  search(query: string, label?: string, limit = 8): KGNode[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter((t) => t.length > 1);
    const scored: [number, KGNode][] = [];
    for (const n of this.nodes.values()) {
      if (label && n.label.toLowerCase() !== label.toLowerCase()) continue;
      const name = n.name.toLowerCase();
      let s = 0;
      if (name === q) s = 100;
      else if (name.startsWith(q)) s = 70;
      else if (name.includes(q)) s = 55;
      else if (q.includes(name) && name.length > 2) s = 50;
      else {
        const hits = tokens.filter((t) => name.includes(t)).length;
        if (hits) s = 20 + hits * 10;
        const desc = String(n.props.description ?? n.props.role ?? "").toLowerCase();
        if (!s && tokens.some((t) => t.length > 3 && desc.includes(t))) s = 10;
      }
      if (s) scored.push([s, n]);
    }
    return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
  }

  resolve(nameOrId: string): KGNode | undefined {
    const direct = this.nodes.get(nameOrId);
    if (direct) return direct;
    return this.search(nameOrId, undefined, 1)[0];
  }

  neighbors(id: string, relType?: string, direction: "out" | "in" | "both" = "both") {
    const res: { edge: KGEdge; node: KGNode; dir: "out" | "in" }[] = [];
    if (direction !== "in")
      for (const e of this.outgoing(id))
        if (!relType || e.type === relType.toUpperCase()) res.push({ edge: e, node: this.nodes.get(e.target)!, dir: "out" });
    if (direction !== "out")
      for (const e of this.incoming(id))
        if (!relType || e.type === relType.toUpperCase()) res.push({ edge: e, node: this.nodes.get(e.source)!, dir: "in" });
    return res;
  }

  /** All shortest-ish simple paths (BFS, undirected) up to maxHops. */
  paths(fromId: string, toId: string, maxHops = 4, limit = 5): KGEdge[][] {
    const results: KGEdge[][] = [];
    type Item = { at: string; path: KGEdge[]; seen: Set<string> };
    const queue: Item[] = [{ at: fromId, path: [], seen: new Set([fromId]) }];
    let shortest = Infinity;
    while (queue.length && results.length < limit) {
      const cur = queue.shift()!;
      if (cur.path.length > Math.min(maxHops, shortest + 1)) continue;
      if (cur.at === toId && cur.path.length) {
        results.push(cur.path);
        shortest = Math.min(shortest, cur.path.length);
        continue;
      }
      if (cur.path.length >= maxHops) continue;
      for (const { edge, node } of this.neighbors(cur.at)) {
        if (cur.seen.has(node.id)) continue;
        const seen = new Set(cur.seen);
        seen.add(node.id);
        queue.push({ at: node.id, path: [...cur.path, edge], seen });
      }
    }
    return results;
  }

  describePath(path: KGEdge[], start: string): string {
    let at = start;
    let s = `(${this.nodes.get(at)?.name})`;
    for (const e of path) {
      if (e.source === at) {
        s += `-[:${e.type}]->(${this.nodes.get(e.target)?.name})`;
        at = e.target;
      } else {
        s += `<-[:${e.type}]-(${this.nodes.get(e.source)?.name})`;
        at = e.source;
      }
    }
    return s;
  }

  degreeRank(label: string, relType?: string, limit = 10) {
    const out: { node: KGNode; degree: number }[] = [];
    for (const n of this.nodes.values()) {
      if (n.label.toLowerCase() !== label.toLowerCase()) continue;
      const d = this.neighbors(n.id, relType).length;
      out.push({ node: n, degree: d });
    }
    return out.sort((a, b) => b.degree - a.degree).slice(0, limit);
  }

  /** Simple label-propagation community detection (deterministic). */
  communities(): Map<string, number> {
    const label = new Map<string, string>();
    for (const id of this.nodes.keys()) label.set(id, id);
    const ids = [...this.nodes.keys()].sort();
    for (let iter = 0; iter < 12; iter++) {
      let changed = false;
      for (const id of ids) {
        const counts = new Map<string, number>();
        for (const { node } of this.neighbors(id)) {
          const l = label.get(node.id)!;
          counts.set(l, (counts.get(l) ?? 0) + 1);
        }
        if (!counts.size) continue;
        const best = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
        if (best !== label.get(id)) {
          label.set(id, best);
          changed = true;
        }
      }
      if (!changed) break;
    }
    const idx = new Map<string, number>();
    const result = new Map<string, number>();
    for (const [id, l] of label) {
      if (!idx.has(l)) idx.set(l, idx.size);
      result.set(id, idx.get(l)!);
    }
    return result;
  }
}
