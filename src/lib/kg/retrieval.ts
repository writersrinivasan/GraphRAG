import { Graph } from "./graph";
import { ENTERPRISE_DOCS } from "./data";
import { KGEdge, KGNode } from "./types";

const STOP = new Set("the a an of and or to in on for with which who what is are was were do does that this by at as be it its their them they from how many most use uses used work works working".split(" "));

export function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9' ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** TF-IDF cosine similarity — a transparent stand-in for embedding search in the classroom. */
export function vectorSearch(query: string, k = 3) {
  const docs = ENTERPRISE_DOCS.map((d) => ({ ...d, toks: tokenize(d.title + " " + d.text) }));
  const df = new Map<string, number>();
  docs.forEach((d) => new Set(d.toks).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
  const N = docs.length;
  const vec = (toks: string[]) => {
    const tf = new Map<string, number>();
    toks.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
    const v = new Map<string, number>();
    tf.forEach((c, t) => v.set(t, c * Math.log(1 + N / (df.get(t) ?? 0.5))));
    return v;
  };
  const norm = (v: Map<string, number>) => Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0)) || 1;
  const qv = vec(tokenize(query));
  const qn = norm(qv);
  return docs
    .map((d) => {
      const dv = vec(d.toks);
      let dot = 0;
      qv.forEach((x, t) => (dot += x * (dv.get(t) ?? 0)));
      return { id: d.id, title: d.title, text: d.text, score: Math.round((dot / (qn * norm(dv))) * 1000) / 1000 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export interface GraphRetrievalStep {
  title: string;
  detail: string[];
  nodes: string[];
  edges: string[];
}

/** Transparent Graph RAG retrieval: entity linking → 1-hop → 2-hop expansion → context lines. */
export function graphRetrieve(g: Graph, question: string, hops = 2, maxFacts = 40) {
  const steps: GraphRetrievalStep[] = [];
  const ql = question.toLowerCase();
  const seeds: KGNode[] = [];
  for (const n of g.nodes.values()) {
    const name = n.name.toLowerCase();
    if (ql.includes(name) || (n.label === "Employee" && ql.includes(name.split(" ")[0]) && name.split(" ")[0].length > 3)) seeds.push(n);
  }
  steps.push({
    title: "1 · Entity linking",
    detail: seeds.length ? seeds.map((s) => `${s.name} (:${s.label})`) : ["No entities found in the question"],
    nodes: seeds.map((s) => s.id),
    edges: [],
  });

  const nodes = new Set(seeds.map((s) => s.id));
  const edges = new Set<string>();
  const facts: string[] = [];
  const factFor = (e: KGEdge) => {
    const a = g.nodes.get(e.source)!;
    const b = g.nodes.get(e.target)!;
    const lvl = e.props?.level ? ` {level: ${e.props.level}}` : "";
    return `(${a.name}:${a.label})-[:${e.type}${lvl}]->(${b.name}:${b.label})`;
  };
  let frontier = seeds.map((s) => s.id);
  for (let h = 1; h <= hops; h++) {
    const next: string[] = [];
    const newEdges: string[] = [];
    for (const id of frontier) {
      const nb = g.neighbors(id);
      // keep high-fanout hubs (domains/departments) from flooding the context on hop 2
      if (h > 1 && nb.length > 8) continue;
      for (const { edge, node } of nb) {
        if (edges.has(edge.id)) continue;
        if (facts.length >= maxFacts) break;
        edges.add(edge.id);
        newEdges.push(edge.id);
        facts.push(factFor(edge));
        if (!nodes.has(node.id)) {
          nodes.add(node.id);
          next.push(node.id);
        }
      }
    }
    steps.push({
      title: `${h + 1} · ${h}-hop expansion`,
      detail: newEdges.slice(0, 12).map((id) => factFor(g.edges.find((e) => e.id === id)!)).concat(newEdges.length > 12 ? [`… +${newEdges.length - 12} more`] : []),
      nodes: [...nodes],
      edges: [...edges],
    });
    frontier = next;
  }
  steps.push({
    title: `${hops + 2} · Context assembly`,
    detail: [`${facts.length} facts · ${nodes.size} entities → serialised as triples for the LLM`],
    nodes: [...nodes],
    edges: [...edges],
  });
  return { steps, facts, nodes: [...nodes], edges: [...edges] };
}
