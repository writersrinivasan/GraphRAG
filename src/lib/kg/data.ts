import { GraphData, KGEdge, KGNode, slugify } from "./types";

/**
 * Enterprise Knowledge Graph used throughout the course
 * (Module 2.6, Module 3.4 and the Module 5.7 "Enterprise Knowledge Graph Assistant").
 * Fictional company: "NovaTech Labs".
 */

type E = { name: string; role: string; dept: string; since: number; location: string };

const employees: E[] = [
  { name: "Priya Sharma", role: "Head of AI", dept: "AI Research", since: 2017, location: "Bengaluru" },
  { name: "John Miller", role: "AI Engineer", dept: "AI Research", since: 2021, location: "Seattle" },
  { name: "Arjun Patel", role: "ML Engineer", dept: "AI Research", since: 2020, location: "Bengaluru" },
  { name: "Meera Iyer", role: "Data Scientist", dept: "AI Research", since: 2022, location: "Chennai" },
  { name: "David Chen", role: "Platform Lead", dept: "Platform Engineering", since: 2016, location: "Singapore" },
  { name: "Sofia Garcia", role: "Backend Engineer", dept: "Platform Engineering", since: 2021, location: "Madrid" },
  { name: "Liam O'Brien", role: "DevOps Engineer", dept: "Platform Engineering", since: 2019, location: "Dublin" },
  { name: "Aisha Khan", role: "Data Engineering Manager", dept: "Data Engineering", since: 2018, location: "Dubai" },
  { name: "Ravi Kumar", role: "Data Engineer", dept: "Data Engineering", since: 2020, location: "Chennai" },
  { name: "Emma Wilson", role: "Analytics Engineer", dept: "Data Engineering", since: 2023, location: "London" },
  { name: "Noah Brown", role: "Product Manager", dept: "Product", since: 2019, location: "New York" },
  { name: "Zara Ali", role: "Security Engineer", dept: "Security", since: 2022, location: "Toronto" },
];

const departments = [
  { name: "AI Research", budget: 4.2, headcount: 4 },
  { name: "Platform Engineering", budget: 3.1, headcount: 3 },
  { name: "Data Engineering", budget: 2.6, headcount: 3 },
  { name: "Product", budget: 1.4, headcount: 1 },
  { name: "Security", budget: 1.9, headcount: 1 },
];

const projects = [
  { name: "Enterprise Copilot", status: "Production", started: 2024, description: "Agentic assistant that answers employee questions over internal tools." },
  { name: "Knowledge Graph Assistant", status: "Pilot", started: 2025, description: "Graph RAG assistant over people, projects and skills." },
  { name: "Fraud Graph Detector", status: "Production", started: 2023, description: "Detects fraud rings using graph algorithms and GNNs." },
  { name: "Customer 360", status: "Production", started: 2022, description: "Unified customer graph across CRM, billing and support." },
  { name: "Supply Chain Optimizer", status: "Development", started: 2025, description: "Supplier dependency graph with risk analytics." },
  { name: "Cyber Threat Graph", status: "Pilot", started: 2025, description: "Threat intelligence knowledge graph linking CVEs, assets and actors." },
  { name: "DocuMind", status: "Development", started: 2025, description: "Document intelligence with vector RAG over contracts." },
];

const technologies = [
  "LangChain", "LangGraph", "LlamaIndex", "Neo4j", "OpenAI API", "Groq", "FAISS", "PyTorch",
  "Apache Spark", "dbt", "AWS", "Kubernetes", "FastAPI", "Graph Data Science",
];

const skills = [
  "Python", "Agentic AI", "NLP", "Graph Modeling", "Machine Learning", "Cloud Architecture",
  "SQL", "Threat Analysis", "Product Strategy", "Prompt Engineering",
];

const domains = ["Generative AI", "Knowledge Graphs", "Graph Analytics", "Data Platform", "Cybersecurity"];

const worksOn: [string, string][] = [
  ["John Miller", "Enterprise Copilot"], ["John Miller", "Knowledge Graph Assistant"],
  ["Priya Sharma", "Knowledge Graph Assistant"], ["Arjun Patel", "Fraud Graph Detector"],
  ["Meera Iyer", "Knowledge Graph Assistant"], ["Meera Iyer", "Customer 360"], ["Meera Iyer", "DocuMind"],
  ["Sofia Garcia", "Enterprise Copilot"], ["Sofia Garcia", "DocuMind"],
  ["Liam O'Brien", "Supply Chain Optimizer"], ["Liam O'Brien", "Enterprise Copilot"],
  ["Ravi Kumar", "Customer 360"], ["Ravi Kumar", "Knowledge Graph Assistant"], ["Ravi Kumar", "Fraud Graph Detector"],
  ["Emma Wilson", "Supply Chain Optimizer"], ["Emma Wilson", "Customer 360"],
  ["Noah Brown", "Enterprise Copilot"], ["Noah Brown", "DocuMind"],
  ["Zara Ali", "Cyber Threat Graph"], ["David Chen", "Cyber Threat Graph"],
];

const knows: [string, string, string][] = [
  ["Priya Sharma", "Machine Learning", "Expert"], ["Priya Sharma", "Agentic AI", "Expert"], ["Priya Sharma", "Python", "Advanced"],
  ["John Miller", "Python", "Expert"], ["John Miller", "Agentic AI", "Advanced"], ["John Miller", "Prompt Engineering", "Advanced"],
  ["Arjun Patel", "Python", "Expert"], ["Arjun Patel", "Machine Learning", "Expert"], ["Arjun Patel", "Graph Modeling", "Intermediate"],
  ["Meera Iyer", "Python", "Advanced"], ["Meera Iyer", "NLP", "Expert"], ["Meera Iyer", "Agentic AI", "Intermediate"],
  ["David Chen", "Cloud Architecture", "Expert"], ["Sofia Garcia", "Python", "Advanced"], ["Sofia Garcia", "Cloud Architecture", "Intermediate"],
  ["Liam O'Brien", "Cloud Architecture", "Advanced"], ["Aisha Khan", "SQL", "Expert"], ["Aisha Khan", "Graph Modeling", "Advanced"],
  ["Ravi Kumar", "Python", "Advanced"], ["Ravi Kumar", "Graph Modeling", "Expert"], ["Ravi Kumar", "SQL", "Advanced"],
  ["Emma Wilson", "SQL", "Expert"], ["Noah Brown", "Product Strategy", "Expert"], ["Noah Brown", "Prompt Engineering", "Intermediate"],
  ["Zara Ali", "Threat Analysis", "Expert"], ["Zara Ali", "Python", "Intermediate"],
];

const manages: [string, string][] = [
  ["Priya Sharma", "John Miller"], ["Priya Sharma", "Arjun Patel"], ["Priya Sharma", "Meera Iyer"],
  ["David Chen", "Sofia Garcia"], ["David Chen", "Liam O'Brien"], ["David Chen", "Zara Ali"],
  ["Aisha Khan", "Ravi Kumar"], ["Aisha Khan", "Emma Wilson"],
];

const uses: [string, string][] = [
  ["Enterprise Copilot", "LangChain"], ["Enterprise Copilot", "LangGraph"], ["Enterprise Copilot", "Groq"],
  ["Enterprise Copilot", "FastAPI"], ["Enterprise Copilot", "Kubernetes"],
  ["Knowledge Graph Assistant", "Neo4j"], ["Knowledge Graph Assistant", "LangChain"], ["Knowledge Graph Assistant", "LangGraph"],
  ["Knowledge Graph Assistant", "OpenAI API"], ["Knowledge Graph Assistant", "FastAPI"],
  ["Fraud Graph Detector", "Neo4j"], ["Fraud Graph Detector", "Graph Data Science"], ["Fraud Graph Detector", "PyTorch"],
  ["Customer 360", "Neo4j"], ["Customer 360", "Apache Spark"], ["Customer 360", "dbt"],
  ["Supply Chain Optimizer", "Apache Spark"], ["Supply Chain Optimizer", "dbt"], ["Supply Chain Optimizer", "AWS"],
  ["Cyber Threat Graph", "Neo4j"], ["Cyber Threat Graph", "LlamaIndex"], ["Cyber Threat Graph", "Graph Data Science"],
  ["DocuMind", "LlamaIndex"], ["DocuMind", "OpenAI API"], ["DocuMind", "FAISS"], ["DocuMind", "AWS"],
];

const relatedTo: [string, string][] = [
  ["Enterprise Copilot", "Generative AI"], ["Knowledge Graph Assistant", "Generative AI"],
  ["Knowledge Graph Assistant", "Knowledge Graphs"], ["Fraud Graph Detector", "Graph Analytics"],
  ["Customer 360", "Data Platform"], ["Customer 360", "Knowledge Graphs"], ["Supply Chain Optimizer", "Data Platform"],
  ["Supply Chain Optimizer", "Graph Analytics"], ["Cyber Threat Graph", "Cybersecurity"],
  ["Cyber Threat Graph", "Knowledge Graphs"], ["DocuMind", "Generative AI"],
];

function build(): GraphData {
  const nodes: KGNode[] = [];
  const edges: KGEdge[] = [];
  const add = (label: string, name: string, props: Record<string, string | number> = {}) =>
    nodes.push({ id: slugify(name), label, name, props: { name, ...props } });
  let eid = 0;
  const link = (a: string, type: string, b: string, props?: Record<string, string | number>) =>
    edges.push({ id: `e${eid++}`, source: slugify(a), target: slugify(b), type, props });

  employees.forEach((e) =>
    add("Employee", e.name, { role: e.role, since: e.since, location: e.location, source: `HR profile: ${e.name}` }),
  );
  departments.forEach((d) => add("Department", d.name, { budget_musd: d.budget, headcount: d.headcount }));
  projects.forEach((p) =>
    add("Project", p.name, { status: p.status, started: p.started, description: p.description, source: `Project charter: ${p.name}` }),
  );
  technologies.forEach((t) => add("Technology", t));
  skills.forEach((s) => add("Skill", s));
  domains.forEach((d) => add("Domain", d));

  employees.forEach((e) => link(e.name, "WORKS_IN", e.dept));
  worksOn.forEach(([a, b]) => link(a, "WORKS_ON", b));
  knows.forEach(([a, b, lvl]) => link(a, "KNOWS", b, { level: lvl }));
  manages.forEach(([a, b]) => link(a, "MANAGES", b));
  uses.forEach(([a, b]) => link(a, "USES", b));
  relatedTo.forEach(([a, b]) => link(a, "RELATED_TO", b));
  return { nodes, edges };
}

export const ENTERPRISE_KG: GraphData = build();

export const KG_SCHEMA_TEXT = `Node labels and properties:
- Employee {name, role, since, location, source}
- Department {name, budget_musd, headcount}
- Project {name, status, started, description, source}
- Technology {name}
- Skill {name}
- Domain {name}
Relationships:
- (:Employee)-[:WORKS_IN]->(:Department)
- (:Employee)-[:WORKS_ON]->(:Project)
- (:Employee)-[:KNOWS {level}]->(:Skill)
- (:Employee)-[:MANAGES]->(:Employee)
- (:Project)-[:USES]->(:Technology)
- (:Project)-[:RELATED_TO]->(:Domain)`;

/** Unstructured "documents" describing the same company — used for the vector-RAG comparison. */
export const ENTERPRISE_DOCS: { id: string; title: string; text: string }[] = [
  { id: "d1", title: "HR profile — John Miller", text: "John Miller is an AI Engineer in the AI Research department based in Seattle. He is an expert Python developer with strong agentic AI and prompt engineering skills." },
  { id: "d2", title: "Project charter — Enterprise Copilot", text: "Enterprise Copilot is an agentic assistant built with LangChain, LangGraph and Groq, served via FastAPI on Kubernetes. Team: John Miller, Sofia Garcia, Liam O'Brien, Noah Brown." },
  { id: "d3", title: "Project charter — Knowledge Graph Assistant", text: "The Knowledge Graph Assistant is a Graph RAG pilot using Neo4j, LangChain, LangGraph and the OpenAI API. It belongs to the Generative AI and Knowledge Graphs domains." },
  { id: "d4", title: "Team page — AI Research", text: "AI Research is led by Priya Sharma, who manages John Miller, Arjun Patel and Meera Iyer." },
  { id: "d5", title: "HR profile — Meera Iyer", text: "Meera Iyer is a Data Scientist in Chennai. She is an NLP expert and has intermediate agentic AI skills. She contributes to Customer 360 and DocuMind." },
  { id: "d6", title: "Project charter — Fraud Graph Detector", text: "Fraud Graph Detector uses Neo4j Graph Data Science and PyTorch graph neural networks to detect fraud rings. Arjun Patel and Ravi Kumar work on it." },
  { id: "d7", title: "Project charter — Cyber Threat Graph", text: "Cyber Threat Graph links CVEs, assets and threat actors in Neo4j with LlamaIndex. Zara Ali and David Chen are the contributors." },
  { id: "d8", title: "Team page — Data Engineering", text: "Aisha Khan manages the Data Engineering team: Ravi Kumar (graph modeling expert) and Emma Wilson (SQL expert)." },
  { id: "d9", title: "Project charter — DocuMind", text: "DocuMind performs document intelligence with LlamaIndex, FAISS and the OpenAI API on AWS. Team: Meera Iyer, Sofia Garcia, Noah Brown." },
  { id: "d10", title: "Project charter — Customer 360", text: "Customer 360 unifies CRM, billing and support into a customer graph built with Apache Spark, dbt and Neo4j." },
];
