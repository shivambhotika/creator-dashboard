"use client";

import { useCurrency } from "@/lib/currency-context";

export function CurrencyToggle() {
  const { mode, toggle } = useCurrency();
  const isUsd = mode === "usd";

  return (
    <button
      onClick={toggle}
      title={`Switch to ${isUsd ? "₹ Lakhs / Crores" : "$ Millions"}`}
      className="flex items-center rounded-lg overflow-hidden text-xs font-bold transition-all shrink-0"
      style={{ border: "1px solid var(--border)", height: 28 }}
    >
      <span
        className="px-2 h-full flex items-center transition-colors"
        style={{
          background: isUsd ? "var(--accent)" : "var(--bg-surface)",
          color: isUsd ? "#fff" : "var(--text-muted)",
        }}
      >
        $
      </span>
      <span
        className="px-2 h-full flex items-center transition-colors"
        style={{
          background: !isUsd ? "var(--accent)" : "var(--bg-surface)",
          color: !isUsd ? "#fff" : "var(--text-muted)",
        }}
      >
        ₹
      </span>
    </button>
  );
}
