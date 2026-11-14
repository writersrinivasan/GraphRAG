export type NodeLabel =
  | "Employee"
  | "Department"
  | "Project"
  | "Technology"
  | "Skill"
  | "Domain"
  | "Entity";

export interface KGNode {
  id: string;
  label: NodeLabel | string;
  name: string;
  props: Record<string, string | number>;
}

export interface KGEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  props?: Record<string, string | number>;
}

export interface GraphData {
  nodes: KGNode[];
  edges: KGEdge[];
}

export interface Highlight {
  nodes: string[];
  edges: string[];
}

export const LABEL_COLORS: Record<string, string> = {
  Employee: "#a78bfa",
  Department: "#f472b6",
  Project: "#22d3ee",
  Technology: "#34d399",
  Skill: "#fbbf24",
  Domain: "#fb7185",
  Entity: "#60a5fa",
  Person: "#a78bfa",
  Organization: "#f472b6",
  Role: "#fb923c",
  Concept: "#fbbf24",
  Location: "#2dd4bf",
  Product: "#22d3ee",
};

export function colorFor(label: string): string {
  if (LABEL_COLORS[label]) return LABEL_COLORS[label];
  let h = 0;
  for (const c of label) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 80% 65%)`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
