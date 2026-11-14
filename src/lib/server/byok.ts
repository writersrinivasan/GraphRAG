import "server-only";

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/** BYOK: the Groq key travels per-request in a header and is never stored or logged server-side. */
export function readKey(req: Request): string | null {
  const k = req.headers.get("x-groq-key")?.trim();
  if (!k || k.length < 20 || k.length > 200 || /\s/.test(k)) return null;
  return k;
}

export function safeModel(m: unknown): string {
  return typeof m === "string" && /^[\w./:-]{3,80}$/.test(m) ? m : DEFAULT_MODEL;
}

export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/401|invalid api key|invalid_api_key/i.test(msg)) return "Groq rejected the API key (401). Check the key in Settings.";
  if (/429|rate limit/i.test(msg)) return "Groq rate limit reached (429). Wait a few seconds and try again, or pick a smaller model.";
  if (/model.*(not found|does not exist|decommissioned)/i.test(msg)) return "That model isn't available on your Groq account. Choose another model in Settings.";
  if (/tool_use_failed|failed to call a function/i.test(msg)) return "The model produced a malformed tool call. Try rephrasing, or switch to a stronger model in Settings.";
  if (/recursion/i.test(msg)) return "The agent hit its step limit without finishing. Try a more specific question.";
  return msg.replace(/gsk_[A-Za-z0-9]+/g, "gsk_***").slice(0, 400);
}

export function ndjsonStream(run: (send: (obj: unknown) => void) => Promise<void>) {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"));
      try {
        await run(send);
      } catch (e) {
        send({ type: "error", message: friendlyError(e) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
