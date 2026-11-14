# GraphRAG Academy

A visual, hands-on web app for the **5-hour training "Graph RAG and Knowledge Graphs for AI"**.
It covers the learning material and the hands-on labs in one place, and includes an agentic AI assistant built
with **LangGraph.js** on **Groq** (BYOK: bring your own key).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# or: npm run build && npm start
```

No `.env` is needed. Open the app, click **Add Groq key** (top right) and paste a key from
https://console.groq.com/keys. The key stays in the browser (tab session, or localStorage if you tick
"Remember"). It is sent per request in the `x-groq-key` header and is never stored or logged on the server.

## What's inside

| Area | Route | Notes |
|---|---|---|
| Home | `/` | Agenda donut, module roadmap, hands-on distribution, architecture, outcomes, prerequisites |
| Learn | `/learn`, `/learn/1…6` | All 6 modules / 37 sections from the TOC, 52 infographics & interactive visuals, code, trainer run-sheet, quiz, progress tracking |
| Labs | `/labs/1…6` | 1 Build a KG · 2 Cypher playground · 3 LLM extraction (Groq) · 4 Construct + dedupe → Cypher · 5 Vector vs Graph retrieval · 6 Graph RAG Q&A agent (Groq) |
| Graph Explorer | `/explorer` | The NovaTech enterprise KG (53 nodes / 103 relationships) with filters, search, communities |
| AI Assistant | `/assistant` | "Graph Guru" tutor agent: searches course content and runs Cypher on the graph |
| Trainer | `/trainer` | Module timer, live run-sheet, day bar, pre-flight checklist, presenter full-screen |

Labs 1, 2, 4 and 5 run entirely in the browser (no key, no Neo4j needed), which makes them a safe fallback
if the venue Wi-Fi fails. Every lab also includes "Do it for real" Python + Neo4j code for AuraDB/Desktop.

## Architecture

```
src/
  lib/kg/          data.ts (NovaTech KG + docs) · graph.ts (traversal, paths, communities)
                   cypher.ts (in-memory, read-only Cypher subset) · retrieval.ts (TF-IDF vs graph retrieval)
  lib/agent/       kg-agent.ts      LangGraph: START → link_entities → agent ⇄ tools(ToolNode) → END
                   extract-graph.ts LangGraph: START → extract → normalize → validate ─(0 triples)→ extract | END
  lib/course/      module content (6 modules), labs, outcomes, course search for the tutor tool
  app/api/         agent (NDJSON stream of the agent trace) · extract · answer · models (key check)
  components/      GraphCanvas (d3-force SVG), visuals/*, labs/*, AgentChat, CypherPlayground, KeyProvider…
```

Agent tools: `search_entities`, `get_neighbors`, `find_paths`, `run_cypher` (read-only), plus
`search_course` in tutor mode. The UI streams every LangGraph node update, tool call and Cypher query, and
highlights the subgraph used for each answer.

Default model: `llama-3.3-70b-versatile` (change it in Settings; it must support tool calling).

## Swapping in a real Neo4j

The in-memory graph keeps the classroom setup-free. To point the agent at Neo4j, replace the bodies of the
tools in `src/lib/agent/kg-agent.ts` with calls through the `neo4j-driver` package (run read queries
with a read-only user) and keep the same tool names and schemas.
