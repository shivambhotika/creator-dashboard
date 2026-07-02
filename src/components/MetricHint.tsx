"use client";

import { Info } from "lucide-react";

export function MetricHint({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center align-middle"
      title={text}
      aria-label={text}
      style={{ color: "var(--text-muted)" }}
    >
      <Info className="h-3.5 w-3.5" />
    </span>
  );
}
