"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { CodeTabs } from "../CodeBlock";
import CypherPlayground from "../CypherPlayground";
import AgentChat from "../AgentChat";
import Lab1Builder from "../labs/Lab1Builder";
import Lab3Extract from "../labs/Lab3Extract";
import Lab4Construct from "../labs/Lab4Construct";
import Lab5Retrieval from "../labs/Lab5Retrieval";
import { SAMPLE_QUESTIONS } from "../visuals/CustomB";
import { LABS } from "@/lib/course";
import { useProgress } from "@/lib/client/progress";
import type { CodeSample } from "@/lib/course/types";

const REAL_WORLD: Record<number, CodeSample[]> = {
  1: [
    { title: "networkx_kg.py", lang: "python", code: `import networkx as nx\n\nG = nx.MultiDiGraph()\ntriples = [("Asha", "WORKS_ON", "Chatbot 2.0"), ("Chatbot 2.0", "USES", "LangGraph")]\nfor s, r, o in triples:\n    G.add_edge(s, o, type=r)\n\nprint(nx.shortest_path(G.to_undirected(), "Asha", "LangGraph"))` },
  ],
  2: [
    { title: "queries.py", lang: "python", code: `from neo4j import GraphDatabase\n\ndriver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))\n\nquery = """\nMATCH (e:Employee)-[:KNOWS]->(:Skill {name: $a}),\n      (e)-[:KNOWS]->(:Skill {name: $b})\nRETURN e.name AS employee, e.role AS role\n"""\nrecords, _, _ = driver.execute_query(query, a="Python", b="Agentic AI", database_="neo4j")\nfor r in records:\n    print(r["employee"], "-", r["role"])` },
    { title: "seed_novatech.cypher", lang: "cypher", code: `// Load a slice of the NovaTech graph into your AuraDB instance\nMERGE (p:Employee {name:"Priya Sharma"}) SET p.role="Head of AI"\nMERGE (j:Employee {name:"John Miller"}) SET j.role="AI Engineer"\nMERGE (d:Department {name:"AI Research"})\nMERGE (k:Project {name:"Knowledge Graph Assistant"})\nMERGE (n:Technology {name:"Neo4j"})\nMERGE (py:Skill {name:"Python"}) MERGE (ag:Skill {name:"Agentic AI"})\nMERGE (p)-[:MANAGES]->(j)\nMERGE (j)-[:WORKS_IN]->(d) MERGE (p)-[:WORKS_IN]->(d)\nMERGE (j)-[:WORKS_ON]->(k) MERGE (k)-[:USES]->(n)\nMERGE (j)-[:KNOWS {level:"Expert"}]->(py)\nMERGE (j)-[:KNOWS {level:"Advanced"}]->(ag);` },
  ],
  3: [
    { title: "extract_langgraph.py", lang: "python", code: `from typing import TypedDict\nfrom pydantic import BaseModel\nfrom langchain_groq import ChatGroq\nfrom langgraph.graph import StateGraph, START, END\n\nclass Triple(BaseModel):\n    subject: str; subject_type: str; relation: str; object: str; object_type: str\nclass KG(BaseModel):\n    triples: list[Triple]\n\nclass S(TypedDict):\n    text: str; triples: list; attempts: int\n\nllm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)\nextractor = llm.with_structured_output(KG)\n\ndef extract(s):   return {"triples": extractor.invoke(s["text"]).triples, "attempts": s["attempts"] + 1}\ndef normalize(s): return {"triples": [t.model_copy(update={"relation": t.relation.upper().replace(" ", "_")}) for t in s["triples"]]}\ndef validate(s):  return {"triples": [t for t in s["triples"] if t.subject != t.object]}\n\ng = StateGraph(S)\ng.add_node("extract", extract); g.add_node("normalize", normalize); g.add_node("validate", validate)\ng.add_edge(START, "extract"); g.add_edge("extract", "normalize"); g.add_edge("normalize", "validate")\ng.add_conditional_edges("validate", lambda s: "extract" if not s["triples"] and s["attempts"] < 2 else END)\napp = g.compile()\nprint(app.invoke({"text": "John works at Microsoft...", "triples": [], "attempts": 0}))` },
  ],
  4: [
    { title: "langchain_store.py", lang: "python", code: `from langchain_neo4j import Neo4jGraph\nfrom langchain_experimental.graph_transformers import LLMGraphTransformer\n\ngraph = Neo4jGraph()\ndocs = LLMGraphTransformer(llm=llm).convert_to_graph_documents(chunks)\ngraph.add_graph_documents(docs, baseEntityLabel=True, include_source=True)\n\n# merge duplicates afterwards with APOC\ngraph.query("""\nMATCH (n:__Entity__)\nWITH toLower(n.id) AS key, collect(n) AS nodes WHERE size(nodes) > 1\nCALL apoc.refactor.mergeNodes(nodes, {properties: 'combine'}) YIELD node\nRETURN count(node)""")` },
  ],
  5: [
    { title: "graph_retriever.py", lang: "python", code: `def graph_retrieve(question: str, k_hops: int = 2) -> str:\n    entities = entity_chain.invoke(question).names        # LLM entity identification\n    rows = graph.query("""\n      UNWIND $names AS name\n      MATCH (n) WHERE toLower(n.name) = toLower(name)\n      CALL apoc.path.subgraphAll(n, {maxLevel: $k}) YIELD relationships\n      UNWIND relationships AS r\n      RETURN DISTINCT startNode(r).name + ' -[' + type(r) + ']-> ' + endNode(r).name AS fact\n      LIMIT 60""", {"names": entities, "k": k_hops})\n    return "\\n".join(r["fact"] for r in rows)\n\ndef hybrid_retrieve(question: str) -> str:\n    vec = vector_store.similarity_search(question, k=3)\n    return graph_retrieve(question) + "\\n\\n" + "\\n".join(d.page_content for d in vec)` },
  ],
  6: [
    { title: "assistant.py", lang: "python", code: `from langgraph.prebuilt import create_react_agent\n\nagent = create_react_agent(\n    llm, tools=[search_entities, get_neighbors, find_paths, run_cypher],\n    prompt=SYSTEM_PROMPT_WITH_SCHEMA,\n)\nfor step in agent.stream({"messages": [("user", "Which projects use LangChain and Neo4j?")]},\n                         stream_mode="updates"):\n    print(step)` },
  ],
};

export default function LabView({ id }: { id: number }) {
  const lab = LABS.find((l) => l.id === id)!;
  const { progress, completeLab } = useProgress();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const prev = LABS.find((l) => l.id === id - 1);
  const next = LABS.find((l) => l.id === id + 1);
  const done = progress.labs.includes(id);
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>();
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read deep-link query after mount
    if (q) setInitialQuestion(q.slice(0, 500));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/labs" className="mb-4 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
        <ArrowLeft size={12} /> All labs
      </Link>
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex items-start gap-4">
          <div className={`rounded-2xl bg-gradient-to-br ${lab.gradient} p-4 shadow-xl`}>
            <Icon name={lab.icon} size={32} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
              <span className="font-bold">Hands-on Lab {lab.id}</span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> {lab.minutes} min
              </span>
              <Link href={`/learn/${lab.module}`} className="hover:underline">
                Module {lab.module}
              </Link>
              {lab.needsKey && (
                <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-200">
                  <KeyRound size={11} /> Uses your Groq key
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black">{lab.title}</h1>
            <p className="mt-1 text-white/65">{lab.goal}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Lab checklist</div>
          {lab.steps.map((s, i) => (
            <button
              key={s}
              onClick={() => {
                const n = new Set(checked);
                if (n.has(i)) n.delete(i);
                else n.add(i);
                setChecked(n);
                if (n.size === lab.steps.length) completeLab(id);
              }}
              className="flex w-full items-start gap-2 py-1 text-left text-sm"
            >
              {checked.has(i) || done ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" /> : <Circle size={16} className="mt-0.5 shrink-0 opacity-40" />}
              <span className={checked.has(i) || done ? "text-white/50 line-through" : ""}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {id === 1 && <Lab1Builder />}
      {id === 2 && <CypherPlayground initial={0} />}
      {id === 3 && <Lab3Extract />}
      {id === 4 && <Lab4Construct />}
      {id === 5 && <Lab5Retrieval />}
      {id === 6 && <AgentChat key={initialQuestion ?? "none"} mode="kg" title="Enterprise Knowledge Graph Assistant" samples={SAMPLE_QUESTIONS} initialQuestion={initialQuestion} />}

      {REAL_WORLD[id] && (
        <section className="mt-10">
          <h2 className="mb-1 text-xl font-black">Do it for real: Python + Neo4j</h2>
          <p className="mb-3 text-sm text-white/60">The same exercise against a real Neo4j instance (AuraDB Free or Desktop) from your own environment.</p>
          <CodeTabs samples={REAL_WORLD[id]} />
        </section>
      )}

      <div className="mt-10 flex justify-between gap-3 border-t border-white/10 pt-6">
        {prev ? (
          <Link href={`/labs/${prev.id}`} className="glass flex items-center gap-2 rounded-xl px-4 py-3 text-sm">
            <ArrowLeft size={16} /> Lab {prev.id}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/labs/${next.id}`} className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${next.gradient} px-4 py-3 text-sm font-semibold`}>
            Lab {next.id}: {next.title} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
