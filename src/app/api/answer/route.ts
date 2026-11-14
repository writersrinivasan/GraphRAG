import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { friendlyError, readKey, safeModel } from "@/lib/server/byok";

export const maxDuration = 30;

/** Lab 5: answer a question strictly from a supplied context (vector vs graph comparison). */
export async function POST(req: Request) {
  const key = readKey(req);
  if (!key) return Response.json({ error: "Missing or malformed Groq API key." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const question = String(body?.question ?? "").slice(0, 1000);
  const context = String(body?.context ?? "").slice(0, 8000);
  if (!question) return Response.json({ error: "question required" }, { status: 400 });
  try {
    const llm = new ChatGroq({ apiKey: key, model: safeModel(body.model), temperature: 0, maxRetries: 1 });
    const res = await llm.invoke([
      new SystemMessage(
        "Answer the question using ONLY the context. If the context is insufficient, say exactly what is missing. Be concise (max 6 bullet points).",
      ),
      new HumanMessage(`Context:\n${context}\n\nQuestion: ${question}`),
    ]);
    return Response.json({ answer: typeof res.content === "string" ? res.content : JSON.stringify(res.content) });
  } catch (e) {
    return Response.json({ error: friendlyError(e) }, { status: 502 });
  }
}
