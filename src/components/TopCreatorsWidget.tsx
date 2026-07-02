"use client";

import { useState } from "react";
import { useCurrency } from "@/lib/currency-context";

type Metric = "impressions" | "clicks" | "installs";

export interface TopCreatorEntry {
  id: string;
  name: string;
  platform: string;
  impressions: number;
  clicks: number;
  installs: number;
}

const PLATFORM_COLOR: Record<string, string> = {
  YouTube:   "#ff0000",
  Instagram: "#e1306c",
  LinkedIn:  "#0a66c2",
  Twitter:   "#1da1f2",
};

const METRIC_LABELS: Record<Metric, string> = {
  impressions: "Views / Reach",
  clicks:      "Clicks",
  installs:    "Installs",
};

export function TopCreatorsWidget({ creators }: { creators: TopCreatorEntry[] }) {
  const { count } = useCurrency();
  const [metric, setMetric] = useState<Metric>("impressions");

  const ranked = [...creators]
    .sort((a, b) => b[metric] - a[metric])
    .filter((c) => c[metric] > 0)
    .slice(0, 3);

  const maxVal = ranked[0]?.[metric] ?? 1;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Top Creators</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>View-first ranking with conversion toggles</p>
        </div>
        <div className="flex gap-1">
          {(["impressions", "clicks", "installs"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={
                metric === m
                  ? { background: "var(--accent)", color: "#fff", border: "none" }
                  : { background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
              }
            >
              {METRIC_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
      >
        {ranked.length === 0 ? (
          <p className="px-6 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>
            No data for this metric yet
          </p>
        ) : (
          <div>
            {ranked.map((c, i) => {
              const val = c[metric];
              const barPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              const isLast = i === ranked.length - 1;
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors"
                  style={{
                    borderBottom: isLast ? "none" : "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <span
                    className="w-8 shrink-0 text-center text-xs font-black tabular-nums"
                    style={{ color: i === 0 ? "#f59e0b" : "var(--text-muted)" }}
                  >
                    {i + 1}
                  </span>

                  {/* Platform dot + name */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: PLATFORM_COLOR[c.platform] ?? "#888" }}
                    />
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {c.name}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                      {c.platform}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 max-w-[120px] h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: "var(--border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${barPct}%`,
                        background: i === 0 ? "#f59e0b" : i === 1 ? "var(--text-muted)" : "#cd7f32",
                      }}
                    />
                  </div>

                  {/* Value */}
                  <span
                    className="text-sm font-bold tabular-nums shrink-0"
                    style={{ color: "var(--text-primary)", minWidth: 60, textAlign: "right" }}
                  >
                    {count(val)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
