import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Icon } from "@/components/Icon";
import { MODULES } from "@/lib/course";

export const metadata = { title: "Learn · GraphRAG Academy" };

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">
        Learning <span className="grad-text">path</span>
      </h1>
      <p className="mt-2 max-w-2xl text-white/65">Six modules, from what a knowledge graph is to building agentic Graph RAG systems. Each module has visual explanations, code, a trainer run-sheet and a quiz.</p>

      <div className="relative mt-10">
        <div className="absolute bottom-0 left-[27px] top-0 hidden w-1 rounded-full bg-gradient-to-b from-violet-500 via-amber-400 to-indigo-500 md:block" />
        <div className="space-y-6">
          {MODULES.map((m) => (
            <div key={m.id} className="relative md:pl-20">
              <div className={`absolute left-0 top-6 hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${m.gradient} text-xl font-black shadow-xl md:flex`}>{m.id}</div>
              <Link href={`/learn/${m.id}`} className="glass group block overflow-hidden rounded-3xl transition hover:border-white/25">
                <div className={`h-1.5 bg-gradient-to-r ${m.gradient}`} />
                <div className="grid gap-4 p-6 lg:grid-cols-[1fr_1.2fr]">
                  <div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Icon name={m.icon} size={18} style={{ color: m.accent }} />
                      Module {m.id}
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {m.minutes} min
                      </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-black group-hover:text-white">{m.title}</h2>
                    <p className="mt-1 text-white/60">{m.tagline}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: m.accent }}>
                      Open module <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {m.sections.map((s) => (
                      <div key={s.id} className="flex items-start gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm">
                        <span className="font-mono text-xs" style={{ color: m.accent }}>
                          {s.id}
                        </span>
                        <span className="text-white/80">{s.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
