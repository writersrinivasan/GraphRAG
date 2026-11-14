import "server-only";
import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { Graph } from "../kg/graph";
import { ENTERPRISE_KG, KG_SCHEMA_TEXT } from "../kg/data";
import { runCypher } from "../kg/cypher";
import { searchCourse } from "../course";

export type AgentMode = "kg" | "tutor";

export interface Collector {
  nodes: Set<string>;
  edges: Set<string>;
  cypher: string[];
}

const graph = new Graph(ENTERPRISE_KG);

function makeTools(c: Collector, mode: AgentMode) {
  const searchEntities = tool(
    async ({ query, label }) => {
      const hits = graph.search(query, label || undefined, 8);
      hits.forEach((h) => c.nodes.add(h.id));
      if (!hits.length) return `No entities match "${query}". Try a shorter or different term.`;
      return JSON.stringify(hits.map((h) => ({ name: h.name, label: h.label, ...h.props })));
    },
    {
      name: "search_entities",
      description: "Fuzzy-search the company knowledge graph for entities (employees, projects, technologies, skills, departments, domains). Use this to find exact names before writing Cypher.",
      schema: z.object({
        query: z.string().describe("Text to search for, e.g. 'langchain' or 'Priya'"),
        label: z.string().optional().describe("Optional label filter: Employee, Department, Project, Technology, Skill, Domain"),
      }),
    },
  );

  const getNeighbors = tool(
    async ({ name, relationship }) => {
      const n = graph.resolve(name);
      if (!n) return `Entity "${name}" not found.`;
      c.nodes.add(n.id);
      const nb = graph.neighbors(n.id, relationship || undefined);
      nb.forEach(({ edge, node }) => {
        c.edges.add(edge.id);
        c.nodes.add(node.id);
      });
      const lines = nb.map(({ edge, node, dir }) => {
        const lvl = edge.props?.level ? ` {level:${edge.props.level}}` : "";
        return dir === "out"
          ? `(${n.name}:${n.label})-[:${edge.type}${lvl}]->(${node.name}:${node.label})`
          : `(${node.name}:${node.label})-[:${edge.type}${lvl}]->(${n.name}:${n.label})`;
      });
      return `${n.name} (${n.label}) ${JSON.stringify(n.props)}\n${lines.join("\n") || "(no relationships)"}`;
    },
    {
      name: "get_neighbors",
      description: "Get an entity's properties and all of its directly connected relationships (1 hop). Optionally filter by relationship type.",
      schema: z.object({
        name: z.string().describe("Entity name"),
        relationship: z.string().optional().describe("Optional relationship type: WORKS_IN, WORKS_ON, KNOWS, MANAGES, USES, RELATED_TO"),
      }),
    },
  );

  const findPaths = tool(
    async ({ from, to, max_hops }) => {
      const a = graph.resolve(from);
      const b = graph.resolve(to);
      if (!a || !b) return `Could not resolve ${!a ? from : to}.`;
      const paths = graph.paths(a.id, b.id, Math.min(max_hops ?? 4, 5), 4);
      c.nodes.add(a.id);
      c.nodes.add(b.id);
      paths.forEach((p) =>
        p.forEach((e) => {
          c.edges.add(e.id);
          c.nodes.add(e.source);
          c.nodes.add(e.target);
        }),
      );
      if (!paths.length) return `No path between ${a.name} and ${b.name} within ${max_hops ?? 4} hops.`;
      return paths.map((p) => graph.describePath(p, a.id)).join("\n");
    },
    {
      name: "find_paths",
      description: "Find the shortest connection paths between two entities (e.g. an employee and a technology). Returns Cypher-style path strings.",
      schema: z.object({
        from: z.string(),
        to: z.string(),
        max_hops: z.number().int().min(1).max(5).optional(),
      }),
    },
  );

  const cypher = tool(
    async ({ query }) => {
      c.cypher.push(query);
      const r = runCypher(graph, query, 40);
      if (r.error) return `Cypher error: ${r.error}\nSchema:\n${KG_SCHEMA_TEXT}`;
      r.highlight.nodes.forEach((n) => c.nodes.add(n));
      r.highlight.edges.forEach((e) => c.edges.add(e));
      if (!r.rows.length) return "Query returned 0 rows. Check exact names with search_entities, or relax the pattern.";
      return JSON.stringify({ columns: r.columns, rows: r.rows });
    },
    {
      name: "run_cypher",
      description:
        "Run a READ-ONLY Cypher query (MATCH ... [WHERE ...] RETURN ... [ORDER BY] [LIMIT]) against the company knowledge graph. Supports comma-separated patterns, variable-length relationships (*1..3), count(), collect(), DISTINCT. Use exact property values.\n" +
        KG_SCHEMA_TEXT,
      schema: z.object({ query: z.string().describe("Cypher query") }),
    },
  );

  const tools = [searchEntities, getNeighbors, findPaths, cypher];

  if (mode === "tutor") {
    tools.push(
      tool(
        async ({ query }) => {
          const hits = searchCourse(query, 4);
          if (!hits.length) return "No matching course content.";
          return hits.map((h) => `[${h.ref}] ${h.title}\n${h.text.slice(0, 1200)}`).join("\n\n---\n\n");
        },
        {
          name: "search_course",
          description: "Search the 5-hour Graph RAG & Knowledge Graphs course material (modules 1-6) for explanations, definitions, architecture and best practices.",
          schema: z.object({ query: z.string() }),
        },
      ) as unknown as (typeof tools)[number],
    );
  }
  return tools;
}

const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  linked: Annotation<string[]>({ reducer: (_a, b) => b, default: () => [] }),
});

const KG_PROMPT = `You are the NovaTech Enterprise Knowledge Graph Assistant, a Graph RAG agent.
You answer questions about the company's employees, departments, projects, technologies, skills and domains
ONLY using facts retrieved from the knowledge graph through your tools. Never invent facts.

Graph schema:
${KG_SCHEMA_TEXT}

Method:
1. Use the linked entities provided (and search_entities if needed) to get exact names.
2. Prefer run_cypher for precise multi-hop / aggregation questions; use get_neighbors and find_paths for exploration.
3. If a query returns an error or 0 rows, fix it and retry (max 3 attempts).
4. Answer concisely in Markdown. Use bullet lists or a small table when listing.
5. End with a "**Graph evidence**" section listing the key paths as (A)-[:REL]->(B) lines, and a "**Sources**" line naming the node types used (e.g. HR profiles, project charters).`;

const TUTOR_PROMPT = `You are "Graph Guru", an expert teaching assistant for a 5-hour technical training on
Graph RAG and Knowledge Graphs for AI (Neo4j, Cypher, LangChain, LangGraph, Microsoft GraphRAG).
Audience: software/AI/data engineers. Explain clearly with analogies, short code (Python/Cypher), and ASCII diagrams when useful.
Use search_course to ground explanations in the course material and cite module/section refs like [Module 4 · 4.5].
When a question is about the NovaTech example company, use the graph tools (run_cypher etc.) and show the Cypher you used.
Keep answers focused and well-formatted in Markdown.

NovaTech graph schema (for demos):
${KG_SCHEMA_TEXT}`;

export function buildAgent(apiKey: string, model: string, mode: AgentMode, c: Collector) {
  const llm = new ChatGroq({ apiKey, model, temperature: 0, maxRetries: 1 });
  const tools = makeTools(c, mode);
  const llmWithTools = llm.bindTools(tools);

  const EntitySchema = z.object({
    entities: z.array(z.string()).describe("Named entities mentioned in the question: people, projects, technologies, skills, departments or domains"),
  });

  async function linkEntities(state: typeof AgentState.State) {
    const last = [...state.messages].reverse().find((m) => m.getType() === "human");
    const question = typeof last?.content === "string" ? last.content : "";
    const found = new Map<string, string>();
    // 1) deterministic surface-form match
    const ql = question.toLowerCase();
    for (const n of graph.nodes.values()) if (n.name.length > 2 && ql.includes(n.name.toLowerCase())) found.set(n.id, `${n.name} (${n.label})`);
    // 2) LLM entity identification → fuzzy link
    try {
      const out = await llm.withStructuredOutput(EntitySchema, { name: "identify_entities" }).invoke([
        new SystemMessage("Extract the named entities from the user's question. Return an empty list if there are none."),
        new HumanMessage(question),
      ]);
      for (const e of out.entities ?? []) {
        const hit = graph.search(e, undefined, 1)[0];
        if (hit) found.set(hit.id, `${hit.name} (${hit.label})`);
      }
    } catch {
      /* fall back to deterministic matches */
    }
    found.forEach((_v, id) => c.nodes.add(id));
    return { linked: [...found.values()] };
  }

  async function callModel(state: typeof AgentState.State) {
    const sys = (mode === "kg" ? KG_PROMPT : TUTOR_PROMPT) + `\n\nLinked entities for this question: ${state.linked.length ? state.linked.join(", ") : "none found"}`;
    const response = await llmWithTools.invoke([new SystemMessage(sys), ...state.messages]);
    return { messages: [response] };
  }

  return new StateGraph(AgentState)
    .addNode("link_entities", linkEntities)
    .addNode("agent", callModel)
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "link_entities")
    .addEdge("link_entities", "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();
}

export function toLangChainMessages(history: { role: string; content: string }[]): BaseMessage[] {
  return history
    .filter((m) => m.content?.trim())
    .slice(-12)
    .map((m) => (m.role === "assistant" ? new AIMessage(m.content) : new HumanMessage(m.content)));
}
