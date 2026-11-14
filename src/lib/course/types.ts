export type Visual =
  | { kind: "flow"; steps: { title: string; desc?: string; icon?: string }[]; caption?: string; wrap?: boolean }
  | { kind: "cards"; items: { title: string; desc: string; icon?: string; tag?: string }[]; cols?: 2 | 3 | 4 }
  | { kind: "compare"; left: { title: string; icon?: string; items: string[] }; right: { title: string; icon?: string; items: string[] } }
  | { kind: "bars"; title?: string; series: string[]; data: { label: string; values: number[] }[]; max?: number; note?: string }
  | { kind: "radar"; axes: string[]; series: { name: string; values: number[] }[]; note?: string }
  | { kind: "timeline"; items: { year: string; title: string; desc: string; icon?: string }[] }
  | { kind: "stack"; layers: { title: string; desc: string; tech?: string; icon?: string }[] }
  | { kind: "custom"; key: string };

export interface CodeSample {
  title: string;
  lang: "python" | "cypher" | "bash" | "typescript" | "json" | "text";
  code: string;
}

export interface Section {
  id: string;
  title: string;
  intro: string;
  points?: { t: string; d: string }[];
  visuals?: Visual[];
  table?: { headers: string[]; rows: string[][] };
  code?: CodeSample[];
  callout?: { kind: "tip" | "trainer" | "warn" | "insight"; text: string };
  lab?: number;
}

export interface QuizQ {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface Module {
  id: number;
  title: string;
  short: string;
  minutes: number;
  gradient: string; // tailwind gradient classes
  accent: string; // hex
  icon: string;
  tagline: string;
  objectives: string[];
  sections: Section[];
  trainer: { minute: string; note: string }[];
  quiz: QuizQ[];
}
