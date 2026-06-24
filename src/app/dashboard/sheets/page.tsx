"use client";

import { ExternalLink, FileSpreadsheet } from "lucide-react";

const SHEETS = [
  {
    label: "Finnet Campaign — Master Tracker",
    description: "Creators c1–c7. Deliverables, payment status, performance logs.",
    url: "https://docs.google.com/spreadsheets/d/1b13aZcqM5q82Hm9KQLKxDVwdVWxdguiBxxgJLrpYzp8",
    campaign: "Wispr India Launch",
    agency: "Finnet",
    tag: "camp-india",
  },
  {
    label: "AEOS Campaign — March 2026",
    description: "Creators c8–c10. USD budget ₹959k (11,420 USD × ₹84).",
    url: null,
    campaign: "Wispr India Launch",
    agency: "AEOS",
    tag: "camp-india",
  },
  {
    label: "Owled — India Launch",
    description: "Creators c11–c20. Real view data loaded. Budget ₹31.85L.",
    url: null,
    campaign: "Wispr India Launch",
    agency: "Owled",
    tag: "camp-india",
  },
  {
    label: "LinkedIn Seeding — Kannada",
    description: "Organic LinkedIn seeding (c21–c31). ₹0 cost.",
    url: null,
    campaign: "Wispr India Launch",
    agency: "Organic",
    tag: "camp-india",
  },
  {
    label: "Mumbai Tech Week — LinkedIn",
    description: "c32–c49. 18 LinkedIn creators at MTW. Budget ₹5.22L.",
    url: null,
    campaign: "Mumbai Tech Week",
    agency: "Social Tag",
    tag: "camp-mtw",
  },
  {
    label: "WLDD × Wispr — June 2026",
    description: "c50–c66. Instagram + YouTube content. ₹0 cost (organic).",
    url: null,
    campaign: "June 2026",
    agency: "Social Tag",
    tag: "camp-june",
  },
  {
    label: "Coding First — June 2026",
    description: "c67–c76. YouTube integrations, dev/coding audience. Budget ₹11.82L.",
    url: null,
    campaign: "June 2026",
    agency: "Direct",
    tag: "camp-june",
  },
];

const CAMPAIGN_COLOR: Record<string, string> = {
  "camp-india": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "camp-mtw":   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "camp-june":  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
};

const CAMPAIGN_LABEL: Record<string, string> = {
  "camp-india": "India Launch",
  "camp-mtw":   "MTW",
  "camp-june":  "June 2026",
};

export default function SheetsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Sheet Links</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          All live Google Sheets connected to this dashboard. Add sheet URLs in Settings to enable live data sync.
        </p>
      </div>

      <div className="space-y-3">
        {SHEETS.map((sheet) => (
          <div
            key={sheet.label}
            className="rounded-xl p-4 flex items-start gap-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--bg-surface)" }}
            >
              <FileSpreadsheet className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {sheet.label}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAMPAIGN_COLOR[sheet.tag]}`}
                >
                  {CAMPAIGN_LABEL[sheet.tag]}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  {sheet.agency}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{sheet.description}</p>
            </div>

            {sheet.url ? (
              <a
                href={sheet.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0"
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                <ExternalLink className="w-3 h-3" />
                Open
              </a>
            ) : (
              <span
                className="text-xs px-3 py-1.5 rounded-lg shrink-0"
                style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                Link pending
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        className="mt-8 rounded-xl p-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Add a new sheet
        </h2>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Go to <strong>Settings → Connect Sheets</strong> to paste Google Sheets CSV export URLs. Once connected,
          the dashboard fetches live data from those sheets on each page load (5-minute cache).
        </p>
      </div>
    </div>
  );
}
