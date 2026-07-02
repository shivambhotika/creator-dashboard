"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export function DetailDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        aria-label="Close details"
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(0,0,0,0.36)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-[440px] overflow-y-auto p-5"
        style={{
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-18px 0 44px rgba(0,0,0,0.22)",
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-nm flex h-9 w-9 shrink-0 items-center justify-center"
            aria-label="Close details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

export function DetailStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const color =
    tone === "good" ? "#10b981" : tone === "warn" ? "#f59e0b" : tone === "bad" ? "#ef4444" : "var(--text-primary)";
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      <p className="label-caps mb-1">{label}</p>
      <p className="text-sm font-semibold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
