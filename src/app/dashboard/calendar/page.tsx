"use client";

import { useState, useMemo } from "react";
import { videos, creators, campaigns, performances, installs } from "@/lib/mock-data";
import type { Video } from "@/types";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

const perfByVideo  = Object.fromEntries(performances.map((p) => [p.videoId, p]));
const installByVideo = Object.fromEntries(installs.map((i) => [i.videoId, i]));

// ── helpers ──────────────────────────────────────────────────

const PLATFORM_COLOR: Record<string, string> = {
  Instagram: "#e1306c",
  YouTube:   "#ff0000",
  LinkedIn:  "#0a66c2",
};

const PLATFORM_BG: Record<string, string> = {
  Instagram: "rgba(225,48,108,0.12)",
  YouTube:   "rgba(255,0,0,0.10)",
  LinkedIn:  "rgba(10,102,194,0.10)",
};

// Platform abbreviation pill
function PlatformIcon({ platform, size = 14 }: { platform: string; size?: number }) {
  const label: Record<string, string> = { Instagram: "IG", YouTube: "YT", LinkedIn: "LI" };
  const color = PLATFORM_COLOR[platform] ?? "#888";
  const bg    = PLATFORM_BG[platform]    ?? "rgba(0,0,0,0.08)";
  return (
    <span style={{
      fontSize: size - 4, fontWeight: 700, color, background: bg,
      borderRadius: 4, padding: "1px 5px", flexShrink: 0, lineHeight: 1.6,
    }}>
      {label[platform] ?? platform.slice(0, 2).toUpperCase()}
    </span>
  );
}

function statusBadge(status: string) {
  const map: Record<string, [string, string]> = {
    Live:      ["#16a34a", "rgba(22,163,74,0.12)"],
    
    Scheduled: ["#d97706", "rgba(217,119,6,0.10)"],
    
  };
  const [color, bg] = map[status] ?? ["#6b7280", "rgba(107,114,128,0.10)"];
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color, background: bg, borderRadius: 4, padding: "1px 6px" }}>
      {status}
    </span>
  );
}

// Build a map: "YYYY-MM-DD" → Video[]
function buildDateMap() {
  const map = new Map<string, Video[]>();
  for (const v of videos) {
    if (!v.goLiveDate) continue;
    const key = v.goLiveDate.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(v);
  }
  return map;
}

const creatorById = Object.fromEntries(creators.map((c) => [c.id, c]));
const campaignById = Object.fromEntries(campaigns.map((c) => [c.id, c]));
const dateMap = buildDateMap();

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ── component ─────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date();
  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(5); // 0-indexed; start at June 2026 (most active)
  const [selected, setSelected] = useState<string | null>(null);

  const { weeks } = useMemo(() => {
    const first = new Date(year, month, 1);
    const dow = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
      ...Array(dow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return { weeks };
  }, [year, month]);

  function nav(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setMonth(m);
    setYear(y);
    setSelected(null);
  }

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedVideos = selected ? (dateMap.get(selected) ?? []) : [];

  // which months have content (for jump dots)
  const activeMonths = useMemo(() => {
    const set = new Set<string>();
    for (const k of dateMap.keys()) set.add(k.slice(0, 7));
    return set;
  }, []);

  const isToday = (day: number) => {
    const d = new Date(year, month, day);
    return d.toDateString() === today.toDateString();
  };

  return (
    <div className="p-6 max-w-5xl" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {dateMap.size} live dates across {videos.length} posts — click any date to see what went live
        </p>
      </div>

      <div className="flex gap-6 items-start flex-wrap lg:flex-nowrap">
        {/* ── Calendar grid ── */}
        <div className="flex-1 min-w-0 rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <button
              onClick={() => nav(-1)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); setSelected(null); }}
                className="text-xs px-2 py-1 rounded-md transition-colors"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "transparent" }}
              >
                Today
              </button>
              <div className="text-center">
                <div className="font-bold text-lg">{MONTHS[month]} {year}</div>
                {!activeMonths.has(`${year}-${String(month + 1).padStart(2, "0")}`) && (
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>No content this month</div>
                )}
              </div>
            </div>
            <button
              onClick={() => nav(+1)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 text-center py-2 px-1">
            {DOW.map((d) => (
              <div key={d} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="px-1 pb-2">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((day, di) => {
                  if (!day) return <div key={di} className="h-16" />;
                  const key = dateKey(day);
                  const dayVideos = dateMap.get(key) ?? [];
                  const isSelected = selected === key;
                  const hasContent = dayVideos.length > 0;
                  const todayCell = isToday(day);

                  // group by platform for dots
                  const platforms = [...new Set(dayVideos.map((v) => v.platform))];

                  return (
                    <button
                      key={di}
                      onClick={() => setSelected(isSelected ? null : key)}
                      className="h-16 flex flex-col items-center pt-1.5 rounded-lg transition-all relative mx-0.5 mb-0.5"
                      title={hasContent ? dayVideos.map(v => creatorById[v.creatorId]?.name ?? v.creatorName).join(", ") : undefined}
                      style={{
                        background: isSelected ? "rgba(99,102,241,0.15)" : hasContent ? "var(--bg-surface)" : "transparent",
                        border: isSelected ? "1.5px solid #6366f1" : todayCell ? "1.5px solid rgba(99,102,241,0.4)" : "1.5px solid transparent",
                        cursor: hasContent ? "pointer" : "default",
                      }}
                      disabled={!hasContent}
                    >
                      <span
                        className="text-sm font-semibold leading-none"
                        style={{
                          color: isSelected ? "#6366f1" : todayCell ? "#6366f1" : "var(--text-primary)",
                        }}
                      >
                        {day}
                      </span>
                      {hasContent && (
                        <div className="flex gap-0.5 mt-1.5 flex-wrap justify-center px-0.5">
                          {platforms.map((p) => {
                            const count = dayVideos.filter((v) => v.platform === p).length;
                            return (
                              <span
                                key={p}
                                className="flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded"
                                style={{ background: PLATFORM_BG[p], color: PLATFORM_COLOR[p] }}
                              >
                                <span style={{ width: 4, height: 4, borderRadius: "50%", background: PLATFORM_COLOR[p], display: "inline-block" }} />
                                {count}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── Side panel ── */}
        <div
          className="w-full lg:w-80 shrink-0 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", minHeight: 300 }}
        >
          {selected ? (
            <>
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="font-semibold text-sm">
                  {new Date(selected + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {selectedVideos.length} post{selectedVideos.length !== 1 ? "s" : ""} went live
                </div>
              </div>
              <div className="divide-y overflow-y-auto" style={{ borderColor: "var(--border)", maxHeight: 520 }}>
                {selectedVideos.map((v) => {
                  const creator = creatorById[v.creatorId];
                  const campaign = campaignById[v.campaignId];
                  return (
                    <div key={v.id} className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0">
                          <PlatformIcon platform={v.platform} size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                              {creator?.name ?? v.creatorName}
                            </span>
                            {statusBadge(v.status)}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {creator?.handle}
                          </div>
                          <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: "var(--bg-surface)" }}
                            >
                              {campaign?.name ?? v.campaignId}
                            </span>
                            <span className="ml-1.5">{v.format}</span>
                          </div>
                          {/* Impact metrics */}
                          {(() => {
                            const perf = perfByVideo[v.id];
                            const inst = installByVideo[v.id];
                            const views   = perf?.views          ?? 0;
                            const clicks  = perf?.clickThroughs   ?? 0;
                            const insts   = inst?.installs        ?? 0;
                            const hasData = views > 0 || clicks > 0 || insts > 0;
                            if (!hasData) return null;
                            return (
                              <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg p-2" style={{ background: "var(--bg-surface)" }}>
                                <div className="text-center">
                                  <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>Views</div>
                                  <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                    {views > 0 ? fmtNum(views) : "—"}
                                  </div>
                                </div>
                                <div className="text-center" style={{ borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                                  <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>Clicks</div>
                                  <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                    {clicks > 0 ? fmtNum(clicks) : "—"}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>Installs</div>
                                  <div className="text-xs font-bold text-indigo-400">
                                    {insts > 0 ? fmtNum(insts) : "—"}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold rounded-md px-2.5 py-1.5 transition-colors"
                            style={{ background: PLATFORM_BG[v.platform], color: PLATFORM_COLOR[v.platform] }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            View post
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--bg-surface)" }}>
                <span className="text-xl">📅</span>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Select a date</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Click any highlighted date to see posts that went live
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Month quick-jump ── */}
      <div className="mt-6 rounded-xl px-5 py-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          Jump to month
        </p>
        <div className="flex flex-wrap gap-2">
          {["2026-03","2026-04","2026-05","2026-06","2026-07"].map((ym) => {
            const [y, m] = ym.split("-").map(Number);
            const active = year === y && month === m - 1;
            const hasContent = activeMonths.has(ym);
            const count = [...dateMap.entries()].filter(([k]) => k.startsWith(ym)).reduce((s, [, vs]) => s + vs.length, 0);
            return (
              <button
                key={ym}
                onClick={() => { setYear(y); setMonth(m - 1); setSelected(null); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: active ? "#6366f1" : "var(--bg-surface)",
                  color: active ? "#fff" : "var(--text-secondary)",
                  border: active ? "none" : "1px solid var(--border)",
                }}
              >
                {MONTHS[m - 1]} {y}
                {hasContent && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: active ? "rgba(255,255,255,0.2)" : "rgba(99,102,241,0.12)", color: active ? "#fff" : "#6366f1" }}
                  >
                    {count} post{count !== 1 ? "s" : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        {Object.entries(PLATFORM_COLOR).map(([p, c]) => (
          <div key={p} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
            {p}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, border: "1.5px solid rgba(99,102,241,0.4)", display: "inline-block" }} />
          Today
        </div>
      </div>
    </div>
  );
}
