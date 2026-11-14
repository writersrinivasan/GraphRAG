import AgentChat from "@/components/AgentChat";

export const metadata = { title: "AI Assistant · GraphRAG Academy" };

const SAMPLES = [
  "Explain Graph RAG vs traditional RAG with an analogy, then show it on NovaTech data.",
  "How does Microsoft GraphRAG global search work?",
  "Write a Cypher query to find who manages people that know Python, and run it.",
  "When should I choose RDF over a labeled property graph?",
  "What are best practices for entity resolution when building a KG with LLMs?",
];

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">
        Graph <span className="grad-text">Guru</span>: your AI tutor
      </h1>
      <p className="mb-6 mt-2 max-w-3xl text-white/65">
        An agentic teaching assistant built with <b>LangGraph.js</b> and <b>Groq</b> (bring your own key). It searches the course material, writes and runs Cypher against the NovaTech graph, and shows each reasoning step and every node it touched.
      </p>
      <AgentChat mode="tutor" title="Graph Guru · course tutor" samples={SAMPLES} />
    </div>
  );
}
