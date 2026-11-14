/**
 * A teaching-sized Cypher interpreter that runs in memory (browser or server).
 * Supported: MATCH (comma-separated patterns, variable-length rels), WHERE (AND/OR/NOT,
 * = <> < > <= >= CONTAINS STARTS WITH ENDS WITH IN), RETURN [DISTINCT] with
 * count()/collect()/labels()/type()/toLower()/size(), AS aliases, ORDER BY, LIMIT.
 * Read-only by design.
 */
import { Graph } from "./graph";
import { KGEdge, KGNode } from "./types";

interface NodePat {
  v: string;
  label?: string;
  props: Record<string, unknown>;
}
interface RelPat {
  v?: string;
  types: string[];
  dir: "out" | "in" | "any";
  min: number;
  max: number;
  varLen: boolean;
}
interface Pattern {
  nodes: NodePat[];
  rels: RelPat[];
}

type Binding = Record<string, KGNode | KGEdge | KGEdge[]>;

export interface CypherResult {
  columns: string[];
  rows: unknown[][];
  highlight: { nodes: string[]; edges: string[] };
  error?: string;
  ms: number;
}

class CypherError extends Error {}

function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      cur += c;
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      continue;
    }
    if ("([{".includes(c)) depth++;
    if (")]}".includes(c)) depth--;
    if (depth === 0 && s.slice(i, i + sep.length).toUpperCase() === sep.toUpperCase()) {
      // word-boundary check for keyword separators
      if (/^\s/.test(sep) || sep === ",") {
        out.push(cur);
        cur = "";
        i += sep.length - 1;
        continue;
      }
    }
    cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter((x) => x.length);
}

function parseLiteral(raw: string): unknown {
  const s = raw.trim();
  if (/^(['"])[\s\S]*\1$/.test(s)) return s.slice(1, -1);
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (/^true$/i.test(s)) return true;
  if (/^false$/i.test(s)) return false;
  if (/^null$/i.test(s)) return null;
  if (s.startsWith("[") && s.endsWith("]")) return splitTop(s.slice(1, -1), ",").map(parseLiteral);
  throw new CypherError(`Cannot parse literal: ${s}`);
}

function parseProps(s: string): Record<string, unknown> {
  const body = s.trim().replace(/^\{|\}$/g, "");
  const props: Record<string, unknown> = {};
  for (const kv of splitTop(body, ",")) {
    const i = kv.indexOf(":");
    if (i < 0) throw new CypherError(`Bad property map: ${kv}`);
    props[kv.slice(0, i).trim()] = parseLiteral(kv.slice(i + 1));
  }
  return props;
}

let anon = 0;
function parseNode(inner: string): NodePat {
  const m = inner.trim().match(/^([A-Za-z_][\w]*)?\s*(?::\s*([A-Za-z_][\w]*))?\s*(\{[\s\S]*\})?$/);
  if (!m) throw new CypherError(`Bad node pattern: (${inner})`);
  return { v: m[1] ?? `_n${anon++}`, label: m[2], props: m[3] ? parseProps(m[3]) : {} };
}

function parseRel(inner: string, left: string, right: string): RelPat {
  const m = inner.trim().match(/^([A-Za-z_]\w*)?\s*(?::\s*([\w|:\s]+?))?\s*(\*\s*(\d+)?\s*(?:\.\.\s*(\d+)?)?)?$/);
  if (!m) throw new CypherError(`Bad relationship pattern: [${inner}]`);
  const types = m[2] ? m[2].split(/\|:?/).map((t) => t.trim().toUpperCase()).filter(Boolean) : [];
  const varLen = !!m[3];
  let min = 1;
  let max = 1;
  if (varLen) {
    const hasRange = m[3].includes("..");
    min = m[4] ? Number(m[4]) : 1;
    max = hasRange ? (m[5] ? Number(m[5]) : 6) : m[4] ? Number(m[4]) : 6;
  }
  const dir = left.includes("<") ? "in" : right.includes(">") ? "out" : "any";
  return { v: m[1], types, dir, min, max: Math.min(max, 6), varLen };
}

function parsePattern(s: string): Pattern {
  const nodes: NodePat[] = [];
  const rels: RelPat[] = [];
  let i = 0;
  const src = s.trim();
  const readNode = () => {
    if (src[i] !== "(") throw new CypherError(`Expected '(' at: ${src.slice(i, i + 20)}`);
    let depth = 0;
    let j = i;
    for (; j < src.length; j++) {
      if (src[j] === "(") depth++;
      if (src[j] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    nodes.push(parseNode(src.slice(i + 1, j)));
    i = j + 1;
  };
  readNode();
  while (i < src.length) {
    const rest = src.slice(i);
    let m = rest.match(/^\s*(<?-)\s*\[([^\]]*)\]\s*(->?)\s*/);
    if (m) {
      rels.push(parseRel(m[2], m[1], m[3]));
    } else {
      m = rest.match(/^\s*(<?--?>?)\s*/);
      if (!m || !m[1].includes("-")) throw new CypherError(`Bad pattern near: ${rest.slice(0, 20)}`);
      const l = m[1].startsWith("<") ? "<-" : "-";
      const r = m[1].endsWith(">") ? "->" : "-";
      rels.push(parseRel("", l, r));
    }
    i += m[0].length;
    readNode();
  }
  return { nodes, rels };
}

// ---------------- expressions ----------------

function isNode(x: unknown): x is KGNode {
  return !!x && typeof x === "object" && "label" in (x as object) && "props" in (x as object);
}
function isEdge(x: unknown): x is KGEdge {
  return !!x && typeof x === "object" && "type" in (x as object) && "source" in (x as object);
}

function evalExpr(expr: string, b: Binding): unknown {
  const e = expr.trim();
  let m: RegExpMatchArray | null;
  if ((m = e.match(/^toLower\((.*)\)$/i))) return String(evalExpr(m[1], b) ?? "").toLowerCase();
  if ((m = e.match(/^toUpper\((.*)\)$/i))) return String(evalExpr(m[1], b) ?? "").toUpperCase();
  if ((m = e.match(/^labels\((\w+)\)$/i))) {
    const n = b[m[1]];
    return isNode(n) ? [n.label] : null;
  }
  if ((m = e.match(/^type\((\w+)\)$/i))) {
    const r = b[m[1]];
    return isEdge(r) ? r.type : null;
  }
  if ((m = e.match(/^(?:size|length)\((\w+)\)$/i))) {
    const r = b[m[1]];
    return Array.isArray(r) ? r.length : r ? 1 : 0;
  }
  if ((m = e.match(/^([A-Za-z_]\w*)\.(\w+)$/))) {
    const t = b[m[1]];
    if (t === undefined) throw new CypherError(`Variable \`${m[1]}\` not defined`);
    if (isNode(t)) return t.props[m[2]] ?? null;
    if (isEdge(t)) return t.props?.[m[2]] ?? null;
    return null;
  }
  if ((m = e.match(/^([A-Za-z_]\w*)$/)) && !/^(true|false|null)$/i.test(e)) {
    if (!(m[1] in b)) throw new CypherError(`Variable \`${m[1]}\` not defined`);
    return b[m[1]];
  }
  return parseLiteral(e);
}

function evalCond(cond: string, b: Binding): boolean {
  const c = cond.trim();
  const ors = splitTop(c, " OR ");
  if (ors.length > 1) return ors.some((x) => evalCond(x, b));
  const ands = splitTop(c, " AND ");
  if (ands.length > 1) return ands.every((x) => evalCond(x, b));
  if (/^NOT\s+/i.test(c)) return !evalCond(c.replace(/^NOT\s+/i, ""), b);
  if (c.startsWith("(") && c.endsWith(")")) return evalCond(c.slice(1, -1), b);
  const m = c.match(/^(.+?)\s*(<>|!=|>=|<=|=|>|<|\s+CONTAINS\s+|\s+STARTS\s+WITH\s+|\s+ENDS\s+WITH\s+|\s+IN\s+)\s*(.+)$/i);
  if (!m) throw new CypherError(`Cannot parse condition: ${c}`);
  const l = evalExpr(m[1], b);
  const r = evalExpr(m[3], b);
  const op = m[2].trim().toUpperCase().replace(/\s+/g, " ");
  switch (op) {
    case "=":
      return l === r;
    case "<>":
    case "!=":
      return l !== r;
    case ">":
      return (l as number) > (r as number);
    case "<":
      return (l as number) < (r as number);
    case ">=":
      return (l as number) >= (r as number);
    case "<=":
      return (l as number) <= (r as number);
    case "CONTAINS":
      return String(l ?? "").includes(String(r));
    case "STARTS WITH":
      return String(l ?? "").startsWith(String(r));
    case "ENDS WITH":
      return String(l ?? "").endsWith(String(r));
    case "IN":
      return Array.isArray(r) && r.includes(l);
  }
  return false;
}

// ---------------- matching ----------------

function nodeOk(n: KGNode, p: NodePat, b: Binding) {
  const bound = b[p.v];
  if (bound && (bound as KGNode).id !== n.id) return false;
  if (p.label && n.label !== p.label) return false;
  for (const [k, v] of Object.entries(p.props)) if (n.props[k] !== v) return false;
  return true;
}

function expand(g: Graph, from: string, r: RelPat): { to: string; edges: KGEdge[] }[] {
  const step = (id: string) => {
    const res: { edge: KGEdge; to: string }[] = [];
    if (r.dir !== "in") for (const e of g.outgoing(id)) if (!r.types.length || r.types.includes(e.type)) res.push({ edge: e, to: e.target });
    if (r.dir !== "out") for (const e of g.incoming(id)) if (!r.types.length || r.types.includes(e.type)) res.push({ edge: e, to: e.source });
    return res;
  };
  if (!r.varLen) return step(from).map((s) => ({ to: s.to, edges: [s.edge] }));
  const out: { to: string; edges: KGEdge[] }[] = [];
  const dfs = (at: string, path: KGEdge[]) => {
    if (path.length >= r.min) out.push({ to: at, edges: path });
    if (path.length >= r.max || out.length > 5000) return;
    for (const s of step(at)) if (!path.includes(s.edge)) dfs(s.to, [...path, s.edge]);
  };
  dfs(from, []);
  return out;
}

function matchPattern(g: Graph, p: Pattern, b: Binding, emit: (b: Binding) => void) {
  const first = p.nodes[0];
  const starts = b[first.v] ? [b[first.v] as KGNode] : [...g.nodes.values()];
  for (const s of starts) {
    if (!nodeOk(s, first, b)) continue;
    const go = (i: number, cur: Binding) => {
      if (i === p.rels.length) return emit(cur);
      const r = p.rels[i];
      const np = p.nodes[i + 1];
      const at = cur[p.nodes[i].v] as KGNode;
      for (const { to, edges } of expand(g, at.id, r)) {
        const n = g.nodes.get(to)!;
        if (!nodeOk(n, np, cur)) continue;
        const next: Binding = { ...cur, [np.v]: n };
        if (r.v) {
          if (r.varLen) next[r.v] = edges;
          else next[r.v] = edges[0];
        }
        next[`__path${anon++}`] = edges;
        go(i + 1, next);
      }
    };
    go(0, { ...b, [first.v]: s });
  }
}

// ---------------- formatting ----------------

export function display(v: unknown): unknown {
  if (isNode(v)) return { _node: v.label, ...v.props };
  if (isEdge(v)) return { _rel: v.type, ...(v.props ?? {}) };
  if (Array.isArray(v)) return v.map(display);
  return v;
}

// ---------------- main ----------------

export function runCypher(g: Graph, query: string, maxRows = 200): CypherResult {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const highlight = { nodes: new Set<string>(), edges: new Set<string>() };
  const done = (columns: string[], rows: unknown[][], error?: string): CypherResult => ({
    columns,
    rows,
    error,
    highlight: { nodes: [...highlight.nodes], edges: [...highlight.edges] },
    ms: Math.round(((typeof performance !== "undefined" ? performance.now() : Date.now()) - t0) * 100) / 100,
  });
  try {
    anon = 0;
    const q = query
      .replace(/\/\/.*$/gm, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/;$/, "");
    if (/\b(CREATE|MERGE|DELETE|DETACH|SET|REMOVE|DROP)\b/i.test(q.replace(/(['"]).*?\1/g, "")))
      throw new CypherError("This in-browser engine is read-only. Use MATCH … RETURN here; write queries run in Neo4j (see the Python tab).");
    const m = q.match(
      /^MATCH\s+(.+?)(?:\s+WHERE\s+(.+?))?\s+RETURN\s+(DISTINCT\s+)?(.+?)(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i,
    );
    if (!m) throw new CypherError("Query must look like: MATCH <pattern> [WHERE …] RETURN … [ORDER BY …] [LIMIT n]");
    const [, matchPart, wherePart, distinct, retPart, orderPart, limitPart] = m;
    const patterns = splitTop(matchPart, ",").map(parsePattern);

    const bindings: Binding[] = [];
    const run = (i: number, b: Binding) => {
      if (bindings.length > 20000) return;
      if (i === patterns.length) {
        if (!wherePart || evalCond(wherePart, b)) bindings.push(b);
        return;
      }
      matchPattern(g, patterns[i], b, (nb) => run(i + 1, nb));
    };
    run(0, {});

    // return items
    const items = splitTop(retPart, ",").map((it) => {
      const am = it.match(/^(.*?)\s+AS\s+(\w+)$/i);
      const expr = (am ? am[1] : it).trim();
      const agg = expr.match(/^(count|collect|sum|avg|min|max)\(\s*(DISTINCT\s+)?(.*?)\s*\)$/i);
      return { expr, alias: am ? am[2] : expr, agg: agg ? { fn: agg[1].toLowerCase(), distinct: !!agg[2], arg: agg[3] } : null };
    });

    for (const b of bindings) {
      for (const [k, v] of Object.entries(b)) {
        if (isNode(v)) highlight.nodes.add(v.id);
        else if (isEdge(v)) highlight.edges.add(v.id);
        else if (Array.isArray(v) && k.startsWith("__path")) v.forEach((e) => highlight.edges.add(e.id));
        else if (Array.isArray(v)) v.forEach((e) => highlight.edges.add(e.id));
      }
    }

    let rows: unknown[][];
    if (items.some((i) => i.agg)) {
      const groups = new Map<string, { keyVals: unknown[]; bs: Binding[] }>();
      for (const b of bindings) {
        const keyVals = items.filter((i) => !i.agg).map((i) => evalExpr(i.expr, b));
        const key = JSON.stringify(keyVals.map(display));
        if (!groups.has(key)) groups.set(key, { keyVals, bs: [] });
        groups.get(key)!.bs.push(b);
      }
      if (!groups.size && items.every((i) => i.agg)) groups.set("[]", { keyVals: [], bs: [] });
      rows = [...groups.values()].map(({ keyVals, bs }) => {
        let k = 0;
        return items.map((it) => {
          if (!it.agg) return keyVals[k++];
          let vals = it.agg.arg === "*" ? bs.map(() => 1) : bs.map((b) => evalExpr(it.agg!.arg, b)).filter((v) => v !== null);
          if (it.agg.distinct) {
            const seen = new Set<string>();
            vals = vals.filter((v) => {
              const s = JSON.stringify(display(v));
              if (seen.has(s)) return false;
              seen.add(s);
              return true;
            });
          }
          const nums = vals as number[];
          switch (it.agg.fn) {
            case "count":
              return vals.length;
            case "collect":
              return vals;
            case "sum":
              return nums.reduce((a, c) => a + c, 0);
            case "avg":
              return nums.length ? Math.round((nums.reduce((a, c) => a + c, 0) / nums.length) * 100) / 100 : null;
            case "min":
              return nums.length ? Math.min(...nums) : null;
            case "max":
              return nums.length ? Math.max(...nums) : null;
          }
          return null;
        });
      });
    } else {
      rows = bindings.map((b) => items.map((it) => evalExpr(it.expr, b)));
    }

    rows = rows.map((r) => r.map(display));
    if (distinct) {
      const seen = new Set<string>();
      rows = rows.filter((r) => {
        const s = JSON.stringify(r);
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
      });
    }

    if (orderPart) {
      const keys = splitTop(orderPart, ",").map((k) => {
        const km = k.match(/^(.*?)(?:\s+(ASC|DESC))?$/i)!;
        const name = km[1].trim();
        const idx = items.findIndex((i) => i.alias === name || i.expr === name);
        if (idx < 0) throw new CypherError(`ORDER BY must reference a returned column or alias: ${name}`);
        return { idx, desc: /desc/i.test(km[2] ?? "") };
      });
      rows.sort((a, b) => {
        for (const { idx, desc } of keys) {
          const x = a[idx] as number | string;
          const y = b[idx] as number | string;
          if (x === y) continue;
          const c = x > y ? 1 : -1;
          return desc ? -c : c;
        }
        return 0;
      });
    }
    const limit = limitPart ? Number(limitPart) : maxRows;
    rows = rows.slice(0, Math.min(limit, maxRows));
    return done(items.map((i) => i.alias), rows);
  } catch (err) {
    return done([], [], err instanceof Error ? err.message : String(err));
  }
}
