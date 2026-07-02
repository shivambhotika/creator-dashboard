"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { creators, videos } from "@/lib/mock-data";
import { Search, Users, Video, Building2, X } from "lucide-react";

// Derive unique agencies from data at module load time
const ALL_AGENCIES = Array.from(
  new Set(creators.map((c) => c.agency).filter(Boolean))
).sort() as string[];

interface Result {
  id: string;
  type: "creator" | "video" | "agency";
  label: string;
  sub: string;
  href: string;
}

function buildIndex(): Result[] {
  const results: Result[] = [];
  for (const c of creators) {
    results.push({
      id: `creator-${c.id}`,
      type: "creator",
      label: c.name,
      sub: `${c.platform} · ${c.agency ?? "—"}`,
      href: `/dashboard/creators`,
    });
  }
  for (const v of videos) {
    results.push({
      id: `video-${v.id}`,
      type: "video",
      label: v.title,
      sub: v.creatorName ?? v.creatorId,
      href: `/dashboard/videos`,
    });
  }
  for (const agency of ALL_AGENCIES) {
    results.push({
      id: `agency-${agency}`,
      type: "agency",
      label: agency,
      sub: `${creators.filter((c) => c.agency === agency).length} creators`,
      href: `/dashboard/agency`,
    });
  }
  return results;
}

const INDEX = buildIndex();

const TYPE_ICON = {
  creator: Users,
  video: Video,
  agency: Building2,
};

const TYPE_LABEL = {
  creator: "Creator",
  video: "Video",
  agency: "Agency",
};

function score(item: Result, q: string): number {
  const name = item.label.toLowerCase();
  const sub = item.sub.toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (sub.includes(q)) return 30;
  return 0;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results: Result[] = query.trim().length === 0
    ? INDEX.slice(0, 8)
    : INDEX.map((item) => ({ item, s: score(item, query.trim().toLowerCase()) }))
        .filter(({ s }) => s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 12)
        .map(({ item }) => item);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  const navigate = useCallback(
    (item: Result) => {
      close();
      // Pass the search term as a URL param so the target page pre-fills its search
      const url = `${item.href}?search=${encodeURIComponent(item.label)}`;
      router.push(url);
    },
    [close, router]
  );

  // ⌘K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  // Auto-focus when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      navigate(results[cursor]);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={close}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          boxShadow: "var(--nm-raised), 0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={handleKey}
            placeholder="Search creators, videos, agencies…"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setCursor(0);
              }}
              style={{ color: "var(--text-muted)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: "var(--bg-surface)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              fontFamily: "monospace",
            }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto py-1">
          {results.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((item, i) => {
              const Icon = TYPE_ICON[item.type];
              const active = i === cursor;
              return (
                <button
                  key={item.id}
                  data-idx={i}
                  onClick={() => navigate(item)}
                  onMouseEnter={() => setCursor(i)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{
                    background: active ? "var(--accent-dim)" : "transparent",
                    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: active ? "var(--accent-dim)" : "var(--bg-surface)",
                      boxShadow: active ? "none" : "var(--nm-inset)",
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: active ? "var(--accent)" : "var(--text-primary)" }}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {item.sub}
                    </p>
                  </div>
                  <span
                    className="text-xs shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {TYPE_LABEL[item.type]}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>↑↓ navigate</span>
            <span>↵ open</span>
          </div>
        </div>
      </div>
    </div>
  );
}
