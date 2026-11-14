"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { CodeSample } from "@/lib/course/types";

const KW: Record<string, string[]> = {
  python: ["from", "import", "def", "class", "return", "for", "in", "if", "else", "with", "as", "print", "True", "False", "None", "lambda", "async", "await"],
  cypher: ["MATCH", "OPTIONAL", "WHERE", "RETURN", "CREATE", "MERGE", "SET", "DELETE", "DETACH", "WITH", "UNWIND", "ORDER", "BY", "LIMIT", "AS", "AND", "OR", "NOT", "DISTINCT", "CALL", "YIELD", "CONSTRAINT", "FOR", "REQUIRE", "IS", "UNIQUE", "IF", "EXISTS", "INDEX", "VECTOR", "ON", "OPTIONS", "DESC", "ASC", "CONTAINS", "STARTS"],
  typescript: ["const", "let", "new", "import", "from", "export", "function", "return", "async", "await"],
  bash: ["pip", "install", "python", "source", "graphrag", "export"],
};

function highlight(code: string, lang: string) {
  const kws = KW[lang] ?? [];
  const comment = lang === "python" || lang === "bash" ? "#[^\\n]*" : "\\/\\/[^\\n]*";
  const re = new RegExp(`(${comment})|("""[\\s\\S]*?"""|"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`[^\`]*\`)|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b[A-Za-z_]\\w*\\b)|(:[A-Z_][A-Za-z_]*)`, "g");
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [t] = m;
    let cls = "";
    if (m[1]) cls = "text-white/40 italic";
    else if (m[2]) cls = "text-emerald-300";
    else if (m[3]) cls = "text-amber-300";
    else if (m[4]) cls = kws.includes(lang === "cypher" ? t.toUpperCase() : t) ? "text-fuchsia-400 font-semibold" : /^[A-Z]/.test(t) && lang === "cypher" ? "text-cyan-300" : "";
    else if (m[5]) cls = "text-cyan-300";
    out.push(cls ? <span key={i++} className={cls}>{t}</span> : t);
    last = m.index + t.length;
  }
  out.push(code.slice(last));
  return out;
}

export function CodeBlock({ sample }: { sample: CodeSample }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0718]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 font-mono text-xs text-white/60">{sample.title}</span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(sample.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed">
        <code className="font-mono">{highlight(sample.code, sample.lang)}</code>
      </pre>
    </div>
  );
}

export function CodeTabs({ samples }: { samples: CodeSample[] }) {
  const [i, setI] = useState(0);
  if (samples.length === 1) return <CodeBlock sample={samples[0]} />;
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {samples.map((s, j) => (
          <button
            key={s.title}
            onClick={() => setI(j)}
            className={`rounded-lg px-3 py-1 font-mono text-xs ${i === j ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/5"}`}
          >
            {s.title}
          </button>
        ))}
      </div>
      <CodeBlock sample={samples[i]} />
    </div>
  );
}
