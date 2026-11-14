"use client";

import { useCallback, useEffect, useState } from "react";

interface Progress {
  sections: string[];
  quiz: Record<string, number>;
  labs: number[];
}

const KEY = "graphrag_progress_v1";
const EMPTY: Progress = { sections: [], quiz: {}, labs: [] };

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useProgress() {
  const [p, setP] = useState<Progress>(EMPTY);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount
    setP(read());
    const on = () => setP(read());
    window.addEventListener("progress-change", on);
    return () => window.removeEventListener("progress-change", on);
  }, []);
  const update = useCallback((fn: (p: Progress) => Progress) => {
    const next = fn(read());
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    setP(next);
    window.dispatchEvent(new Event("progress-change"));
  }, []);
  return {
    progress: p,
    toggleSection: (id: string) =>
      update((x) => ({ ...x, sections: x.sections.includes(id) ? x.sections.filter((s) => s !== id) : [...x.sections, id] })),
    setQuiz: (mod: number, score: number) => update((x) => ({ ...x, quiz: { ...x.quiz, [mod]: Math.max(score, x.quiz[mod] ?? 0) } })),
    completeLab: (id: number) => update((x) => ({ ...x, labs: x.labs.includes(id) ? x.labs : [...x.labs, id] })),
    reset: () => update(() => EMPTY),
  };
}
