import { module1, module2, module3 } from "./modules-a";
import { module4, module5, module6 } from "./modules-b";
import { Module } from "./types";
import { glossaryPassages } from "./glossary";

export const MODULES: Module[] = [module1, module2, module3, module4, module5, module6];

export function getModule(id: number) {
  return MODULES.find((m) => m.id === id);
}

export interface Lab {
  id: number;
  title: string;
  minutes: number;
  module: number;
  icon: string;
  gradient: string;
  goal: string;
  steps: string[];
  needsKey?: boolean;
}

export const LABS: Lab[] = [
  {
    id: 1, title: "Create a basic Knowledge Graph", minutes: 15, module: 2, icon: "Network",
    gradient: "from-violet-500 to-fuchsia-500",
    goal: "Build a knowledge graph by hand from triples, and watch it grow node by node.",
    steps: ["Add triples with the form (or load the starter set)", "Watch nodes & edges appear in the live graph", "Inspect the adjacency list and triple table", "Click a node to explore its neighbourhood", "Export the graph as Cypher MERGE statements"],
  },
  {
    id: 2, title: "Neo4j setup and Cypher queries", minutes: 20, module: 3, icon: "Database",
    gradient: "from-emerald-500 to-cyan-500",
    goal: "Write Cypher against the NovaTech enterprise graph and see matching subgraphs light up.",
    steps: ["Run the preset queries, from basic to advanced", "Modify a WHERE clause and re-run", "Write a variable-length MANAGES*1..2 query", "Write an aggregation with count() and collect()", "Copy the same queries to your Neo4j AuraDB instance"],
  },
  {
    id: 3, title: "LLM-based entity & relationship extraction", minutes: 15, module: 5, icon: "Brain",
    gradient: "from-pink-500 to-orange-400", needsKey: true,
    goal: "Use a LangGraph extraction pipeline (extract → normalise → validate) on Groq to turn text into triples.",
    steps: ["Pick a sample paragraph or paste your own", "Run the LangGraph extraction pipeline", "Review entities, types and triples", "Watch the pipeline trace (each LangGraph node)", "Send the result to Lab 4"],
  },
  {
    id: 4, title: "Construct graph from extracted data", minutes: 15, module: 5, icon: "Merge",
    gradient: "from-amber-500 to-red-500",
    goal: "Normalise, deduplicate and merge extracted triples into a graph, and generate Neo4j-ready Cypher.",
    steps: ["Load triples from Lab 3 (or the sample)", "Review the duplicate candidates found", "Apply merges and watch the graph shrink", "Validate: orphan nodes, schema violations", "Copy the generated Cypher into Neo4j"],
  },
  {
    id: 5, title: "Implement Graph RAG retrieval", minutes: 20, module: 5, icon: "Search",
    gradient: "from-sky-500 to-indigo-500",
    goal: "Compare vector-style chunk retrieval with graph retrieval for the same question, step by step.",
    steps: ["Choose a sample multi-hop question", "See which chunks vector retrieval returns", "Step through entity linking → traversal → context", "Compare the two contexts side by side", "(Optional) Ask Groq to answer from each context"],
  },
  {
    id: 6, title: "Build a Graph RAG Q&A assistant", minutes: 20, module: 5, icon: "Bot",
    gradient: "from-indigo-500 to-purple-500", needsKey: true,
    goal: "Chat with a LangGraph agent that links entities, writes Cypher and traverses the graph to answer, then shows its path.",
    steps: ["Add your Groq API key (BYOK)", "Ask the 5 sample questions", "Read the agent trace: nodes, tool calls, Cypher", "See the answer's subgraph highlighted", "Ask your own follow-up questions"],
  },
];

export const OUTCOMES = [
  "Understand Knowledge Graphs and their role in modern AI applications.",
  "Differentiate graph databases, relational databases and vector databases.",
  "Design and construct Knowledge Graphs using Neo4j.",
  "Write Cypher queries to retrieve connected information.",
  "Understand the architecture and working principles of Graph RAG.",
  "Extract entities and relationships using LLMs.",
  "Build a basic Graph RAG pipeline using Python.",
  "Combine graph retrieval and vector search.",
  "Understand multi-hop reasoning and contextual retrieval.",
  "Explore integration of Graph RAG with Agentic AI systems.",
];

export const ARCHITECTURE = [
  { layer: "Application", tech: "Streamlit / FastAPI / Next.js", icon: "MonitorSmartphone" },
  { layer: "Agentic Workflow", tech: "LangGraph", icon: "Workflow" },
  { layer: "RAG Orchestration", tech: "LangChain / LlamaIndex", icon: "Link" },
  { layer: "Graph Retrieval", tech: "Cypher", icon: "Route" },
  { layer: "Vector Search", tech: "Neo4j Vector Index", icon: "Sparkles" },
  { layer: "Knowledge Graph", tech: "Neo4j", icon: "Database" },
  { layer: "Embeddings", tech: "OpenAI / Sentence Transformers", icon: "Atom" },
  { layer: "Entity extraction", tech: "OpenAI / Claude / Gemini / Groq", icon: "Brain" },
  { layer: "Document processing", tech: "PyPDF, Unstructured", icon: "FileText" },
  { layer: "Data ingestion", tech: "Python, LangChain", icon: "Download" },
  { layer: "Deployment", tech: "AWS", icon: "Cloud" },
];

export const PREREQS = [
  ["Python", "3.11 or newer"],
  ["IDE", "VS Code"],
  ["Graph Database", "Neo4j AuraDB or Neo4j Desktop"],
  ["LLM API", "OpenAI / Claude / Gemini / Groq"],
  ["Framework", "LangChain"],
  ["Graph Orchestration", "LangGraph"],
  ["Vector Search", "Neo4j Vector Index"],
  ["Browser", "Chrome / Edge"],
  ["API Testing", "Postman (optional)"],
];

/** Flatten course content into searchable passages (used by the AI tutor tool). */
export function coursePassages() {
  const out: { ref: string; title: string; text: string }[] = [];
  for (const m of MODULES) {
    for (const s of m.sections) {
      const parts = [s.intro];
      s.points?.forEach((p) => parts.push(`${p.t}: ${p.d}`));
      s.table?.rows.forEach((r) => parts.push(r.join(" | ")));
      s.visuals?.forEach((v) => {
        if (v.kind === "cards") v.items.forEach((i) => parts.push(`${i.title}: ${i.desc}`));
        if (v.kind === "flow") parts.push(v.steps.map((x) => `${x.title} (${x.desc ?? ""})`).join(" → "));
        if (v.kind === "timeline") v.items.forEach((i) => parts.push(`${i.year} ${i.title}: ${i.desc}`));
        if (v.kind === "stack") v.layers.forEach((l) => parts.push(`${l.title}: ${l.desc}`));
      });
      if (s.callout) parts.push(s.callout.text);
      out.push({ ref: `Module ${m.id} · ${s.id}`, title: s.title, text: parts.join("\n") });
    }
  }
  return [...out, ...glossaryPassages()];
}

export function searchCourse(query: string, k = 4) {
  const q = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  return coursePassages()
    .map((p) => {
      const hay = (p.title + " " + p.text).toLowerCase();
      const score = q.reduce((s, t) => s + (hay.split(t).length - 1) + (p.title.toLowerCase().includes(t) ? 3 : 0), 0);
      return { ...p, score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
