import { buildExtractionPipeline, Triple } from "@/lib/agent/extract-graph";
import { ndjsonStream, readKey, safeModel } from "@/lib/server/byok";

export const maxDuration = 60;

export async function POST(req: Request) {
  const key = readKey(req);
  if (!key) return Response.json({ error: "Missing or malformed Groq API key. Add it in Settings (BYOK)." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.slice(0, 6000) : "";
  if (!text.trim()) return Response.json({ error: "Provide some text to extract from." }, { status: 400 });

  return ndjsonStream(async (send) => {
    const app = buildExtractionPipeline(key, safeModel(body.model));
    const t0 = Date.now();
    let triples: Triple[] = [];
    let issues: string[] = [];
    const stream = await app.stream(
      { text, allowedTypes: typeof body.allowedTypes === "string" ? body.allowedTypes.slice(0, 300) : "" },
      { streamMode: "updates", recursionLimit: 10 },
    );
    for await (const chunk of stream) {
      for (const [node, u] of Object.entries(chunk as Record<string, Record<string, unknown>>)) {
        if (node === "extract") send({ type: "step", node, count: (u.raw as Triple[]).length, attempt: u.attempts, raw: u.raw });
        if (node === "normalize") send({ type: "step", node, count: (u.triples as Triple[]).length, triples: u.triples });
        if (node === "validate") {
          triples = u.triples as Triple[];
          issues = u.issues as string[];
          send({ type: "step", node, count: triples.length, issues });
        }
      }
    }
    send({ type: "final", triples, issues, ms: Date.now() - t0 });
  });
}
