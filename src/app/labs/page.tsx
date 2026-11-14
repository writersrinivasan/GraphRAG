import Link from "next/link";
import { ArrowRight, Clock, KeyRound } from "lucide-react";
import { Icon } from "@/components/Icon";
import { LABS } from "@/lib/course";

export const metadata = { title: "Hands-on Labs · GraphRAG Academy" };

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-black">
        Hands-on <span className="grad-text">labs</span>
      </h1>
      <p className="mt-2 max-w-2xl text-white/65">
        Six progressive labs, 105 minutes in total, that take you from a hand-drawn graph to a working Graph RAG agent. Labs 1, 2, 4 and 5 run fully in the browser; Labs 3 and 6 call Groq with your own key.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LABS.map((l) => (
          <Link key={l.id} href={`/labs/${l.id}`} className="glass group relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:border-white/25">
            <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${l.gradient} opacity-25 blur-2xl transition group-hover:opacity-50`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={`rounded-2xl bg-gradient-to-br ${l.gradient} p-3`}>
                  <Icon name={l.icon} size={24} />
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  {l.needsKey && (
                    <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-orange-200">
                      <KeyRound size={11} /> Groq
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {l.minutes} min
                  </span>
                </div>
              </div>
              <div className="mt-4 text-xs text-white/50">
                Lab {l.id} · Module {l.module}
              </div>
              <h2 className="text-xl font-bold">{l.title}</h2>
              <p className="mt-2 text-sm text-white/65">{l.goal}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-fuchsia-200">
                Start lab <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
