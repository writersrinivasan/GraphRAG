import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { buildAgent, Collector, toLangChainMessages, AgentMode } from "@/lib/agent/kg-agent";
import { ndjsonStream, readKey, safeModel } from "@/lib/server/byok";

export const maxDuration = 60;

export async function POST(req: Request) {
  const key = readKey(req);
  if (!key) return Response.json({ error: "Missing or malformed Groq API key. Add it in Settings (BYOK)." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) return Response.json({ error: "Body must include messages[]" }, { status: 400 });
  const mode: AgentMode = body.mode === "tutor" ? "tutor" : "kg";
  const model = safeModel(body.model);

  return ndjsonStream(async (send) => {
    const collector: Collector = { nodes: new Set(), edges: new Set(), cypher: [] };
    const app = buildAgent(key, model, mode, collector);
    const t0 = Date.now();
    const stream = await app.stream(
      { messages: toLangChainMessages(body.messages) },
      { streamMode: "updates", recursionLimit: 16 },
    );
    let final = "";
    for await (const chunk of stream) {
      for (const [node, update] of Object.entries(chunk as Record<string, Record<string, unknown>>)) {
        if (node === "link_entities") {
          send({ type: "step", node, label: "Entity linking", detail: (update.linked as string[]) ?? [] });
        } else if (node === "agent") {
          const msgs = (update.messages as AIMessage[]) ?? [];
          for (const m of msgs) {
            if (m.tool_calls?.length) {
              send({ type: "step", node, label: "Agent planned tool calls", detail: [] });
              for (const tc of m.tool_calls) send({ type: "tool_call", id: tc.id, name: tc.name, args: tc.args });
            } else {
              final = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
              send({ type: "step", node, label: "Agent composed the answer", detail: [] });
            }
          }
        } else if (node === "tools") {
          const msgs = (update.messages as ToolMessage[]) ?? [];
          for (const m of msgs) {
            const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
            send({ type: "tool_result", id: m.tool_call_id, name: m.name, content: content.slice(0, 1500) });
          }
        }
        send({ type: "highlight", nodes: [...collector.nodes], edges: [...collector.edges] });
      }
    }
    send({ type: "final", content: final, cypher: collector.cypher, ms: Date.now() - t0, model });
  });
}
