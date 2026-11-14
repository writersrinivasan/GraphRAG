"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookA, BookOpen, Bot, FlaskConical, Home, KeyRound, Menu, Network, Presentation, X } from "lucide-react";
import { useGroq } from "./KeyProvider";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/labs", label: "Hands-on Labs", icon: FlaskConical },
  { href: "/glossary", label: "Glossary", icon: BookA },
  { href: "/explorer", label: "Graph Explorer", icon: Network },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/trainer", label: "Trainer", icon: Presentation },
];

export default function Nav() {
  const path = usePathname();
  const { hasKey, openSettings, model } = useGroq();
  const [open, setOpen] = useState(false);
  const isActive = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07051a]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0b0820]">
              <Network size={18} className="text-fuchsia-300" />
            </div>
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            Graph<span className="grad-text">RAG</span> Academy
          </span>
        </Link>
        <nav className="ml-4 hidden gap-1 xl:flex">
          {LINKS.map(({ href, label, icon: I }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition ${
                isActive(href) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <I size={15} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={openSettings}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
              hasKey ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-orange-400/50 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20"
            }`}
          >
            <KeyRound size={14} />
            <span className="hidden sm:inline">{hasKey ? `Groq · ${model.split("/").pop()}` : "Add Groq key"}</span>
            <span className={`h-2 w-2 rounded-full ${hasKey ? "bg-emerald-400" : "bg-orange-400 animate-pulse"}`} />
          </button>
          <button className="rounded-lg p-2 xl:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 p-3 xl:hidden">
          {LINKS.map(({ href, label, icon: I }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${isActive(href) ? "bg-white/10" : "text-white/70"}`}
            >
              <I size={16} /> {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
