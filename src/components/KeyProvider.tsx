"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, KeyRound, Loader2, ShieldCheck, X, XCircle } from "lucide-react";

const DEFAULT_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.1-8b-instant"];

interface Ctx {
  apiKey: string;
  model: string;
  hasKey: boolean;
  openSettings: () => void;
}

const KeyCtx = createContext<Ctx>({ apiKey: "", model: DEFAULT_MODELS[0], hasKey: false, openSettings: () => {} });
export const useGroq = () => useContext(KeyCtx);

function load(k: string, store: "local" | "session") {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(k) ?? "";
  } catch {
    return "";
  }
}

export function KeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODELS[0]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from browser storage after mount
    setApiKey(load("groq_key", "session") || load("groq_key", "local"));
    setModel(load("groq_model", "local") || DEFAULT_MODELS[0]);
  }, []);

  const openSettings = useCallback(() => setOpen(true), []);

  return (
    <KeyCtx.Provider value={{ apiKey, model, hasKey: apiKey.length > 20, openSettings }}>
      {children}
      {open && (
        <SettingsModal
          initialKey={apiKey}
          initialModel={model}
          onClose={() => setOpen(false)}
          onSave={(k, m, remember) => {
            setApiKey(k);
            setModel(m);
            try {
              sessionStorage.setItem("groq_key", k);
              if (remember) localStorage.setItem("groq_key", k);
              else localStorage.removeItem("groq_key");
              localStorage.setItem("groq_model", m);
            } catch {}
            setOpen(false);
          }}
        />
      )}
    </KeyCtx.Provider>
  );
}

function SettingsModal({
  initialKey,
  initialModel,
  onClose,
  onSave,
}: {
  initialKey: string;
  initialModel: string;
  onClose: () => void;
  onSave: (k: string, m: string, remember: boolean) => void;
}) {
  const [key, setKey] = useState(initialKey);
  const [model, setModel] = useState(initialModel);
  const [remember, setRemember] = useState(() => !!load("groq_key", "local"));
  const [models, setModels] = useState<string[]>(DEFAULT_MODELS);
  const [status, setStatus] = useState<{ kind: "idle" | "testing" | "ok" | "err"; msg?: string }>({ kind: "idle" });

  async function test() {
    setStatus({ kind: "testing" });
    try {
      const r = await fetch("/api/models", { headers: { "x-groq-key": key.trim() } });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      const list: string[] = j.models;
      setModels(list.length ? list : DEFAULT_MODELS);
      if (list.length && !list.includes(model)) setModel(list.includes(DEFAULT_MODELS[0]) ? DEFAULT_MODELS[0] : list[0]);
      setStatus({ kind: "ok", msg: `Key works · ${list.length} models available` });
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Failed" });
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass relative w-full max-w-lg rounded-3xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white" aria-label="Close">
          <X size={20} />
        </button>
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-3">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Bring Your Own Key: Groq</h2>
            <p className="text-sm text-white/60">Powers the AI Assistant and the LLM labs.</p>
          </div>
        </div>

        <label className="mb-1 block text-sm font-medium text-white/80">Groq API key</label>
        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setStatus({ kind: "idle" });
          }}
          placeholder="gsk_…"
          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-sm outline-none focus:border-fuchsia-400"
          autoComplete="off"
          spellCheck={false}
        />
        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-300 hover:underline"
        >
          Get a free key at console.groq.com <ExternalLink size={12} />
        </a>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={test}
            disabled={key.trim().length < 20 || status.kind === "testing"}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-40"
          >
            {status.kind === "testing" ? <Loader2 size={16} className="animate-spin" /> : "Test key & load models"}
          </button>
          {status.kind === "ok" && (
            <span className="flex items-center gap-1 text-sm text-emerald-300">
              <CheckCircle2 size={16} /> {status.msg}
            </span>
          )}
          {status.kind === "err" && (
            <span className="flex items-center gap-1 text-sm text-rose-300">
              <XCircle size={16} /> {status.msg}
            </span>
          )}
        </div>

        <label className="mb-1 mt-5 block text-sm font-medium text-white/80">Model (must support tool calling)</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
        >
          {[...new Set([model, ...models])].map((m) => (
            <option key={m} value={m} className="bg-slate-900">
              {m}
            </option>
          ))}
        </select>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-fuchsia-500" />
          Remember on this device (localStorage). Otherwise the key is kept only for this browser tab.
        </label>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          The key stays in your browser. It is sent with each request in the <code>x-groq-key</code> header to this app&apos;s
          API routes, which pass it to Groq and never store or log it.
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {initialKey && (
            <button
              onClick={() => onSave("", model, false)}
              className="rounded-xl px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
            >
              Remove key
            </button>
          )}
          <button
            onClick={() => onSave(key.trim(), model, remember)}
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:brightness-110"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function KeyGate({ children, feature }: { children: React.ReactNode; feature: string }) {
  const { hasKey, openSettings } = useGroq();
  if (hasKey) return <>{children}</>;
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
      <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-4">
        <KeyRound size={28} />
      </div>
      <h3 className="text-lg font-bold">Add your Groq API key to use {feature}</h3>
      <p className="max-w-md text-sm text-white/60">
        This app is BYOK (Bring Your Own Key). Groq has a free tier: create a key at console.groq.com and paste it in
        Settings.
      </p>
      <button
        onClick={openSettings}
        className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-orange-400 px-5 py-2.5 text-sm font-semibold shadow-lg hover:brightness-110"
      >
        Open Settings
      </button>
    </div>
  );
}
