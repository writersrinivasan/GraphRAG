"use client";

/** POST JSON and consume an NDJSON response line by line. */
export async function streamNDJSON(
  url: string,
  body: unknown,
  apiKey: string,
  onEvent: (e: Record<string, unknown>) => void,
  signal?: AbortSignal,
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-groq-key": apiKey },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const j = await res.json().catch(() => ({}));
    throw new Error((j as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line) onEvent(JSON.parse(line));
    }
  }
  if (buf.trim()) onEvent(JSON.parse(buf));
}
