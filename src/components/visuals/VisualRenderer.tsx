"use client";

import type { Visual } from "@/lib/course/types";
import { Bars, Cards, Compare, Flow, Radar, Stack, Timeline } from "./Primitives";
import { CUSTOM_A } from "./CustomA";
import { CUSTOM_B } from "./CustomB";

const CUSTOM = { ...CUSTOM_A, ...CUSTOM_B };

export default function VisualRenderer({ v }: { v: Visual }) {
  switch (v.kind) {
    case "flow":
      return <Flow v={v} />;
    case "cards":
      return <Cards v={v} />;
    case "compare":
      return <Compare v={v} />;
    case "bars":
      return <Bars v={v} />;
    case "radar":
      return <Radar v={v} />;
    case "timeline":
      return <Timeline v={v} />;
    case "stack":
      return <Stack v={v} />;
    case "custom": {
      const C = CUSTOM[v.key];
      return C ? <C /> : <div className="text-xs text-rose-300">Missing visual: {v.key}</div>;
    }
  }
}
