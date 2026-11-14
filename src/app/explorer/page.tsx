import KGExplorer from "@/components/KGExplorer";
import { CodeBlock } from "@/components/CodeBlock";
import { KG_SCHEMA_TEXT } from "@/lib/kg/data";

export const metadata = { title: "Graph Explorer · GraphRAG Academy" };

export default function ExplorerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">
        NovaTech <span className="grad-text">Graph Explorer</span>
      </h1>
      <p className="mb-6 mt-2 max-w-3xl text-white/65">
        The enterprise knowledge graph behind every demo in this course: 12 employees, 5 departments, 7 projects, 14 technologies, 10 skills and 5 domains. Filter by label, search, colour by community and click any node.
      </p>
      <KGExplorer height={620} />
      <div className="mt-6">
        <CodeBlock sample={{ title: "schema.txt", lang: "text", code: KG_SCHEMA_TEXT }} />
      </div>
    </div>
  );
}
