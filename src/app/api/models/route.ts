import { friendlyError, readKey } from "@/lib/server/byok";

/** Verifies a BYOK Groq key and lists the chat models it can use. */
export async function GET(req: Request) {
  const key = readKey(req);
  if (!key) return Response.json({ ok: false, error: "Missing or malformed key" }, { status: 401 });
  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!r.ok) return Response.json({ ok: false, error: friendlyError(new Error(`${r.status} ${await r.text()}`)) }, { status: r.status });
    const data = (await r.json()) as { data: { id: string; active?: boolean }[] };
    const models = data.data
      .filter((m) => m.active !== false && !/whisper|tts|guard|playai|orpheus|prompt-guard/i.test(m.id))
      .map((m) => m.id)
      .sort();
    return Response.json({ ok: true, models });
  } catch (e) {
    return Response.json({ ok: false, error: friendlyError(e) }, { status: 502 });
  }
}
