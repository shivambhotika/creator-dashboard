"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Video, BarChart2,
  DollarSign, ExternalLink, Sun, Moon, Settings, CalendarDays, X,
} from "lucide-react";

const nav = [
  { href: "/dashboard",             label: "Overview",     icon: LayoutDashboard },
  { href: "/dashboard/creators",    label: "Creators",     icon: Users },
  { href: "/dashboard/videos",      label: "Videos",       icon: Video },
  { href: "/dashboard/calendar",    label: "Calendar",     icon: CalendarDays },
  { href: "/dashboard/performance", label: "Performance",  icon: BarChart2 },
  { href: "/dashboard/costs",       label: "Costs & ROI",  icon: DollarSign },
];

function SidebarContent({ onClose, pathname, theme, toggle }: {
  onClose?: () => void;
  pathname: string;
  theme: string;
  toggle: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
          <Video className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Creator Ops</span>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Marketing Dashboard</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all md:hidden"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Analytics
        </p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active ? "bg-indigo-600 text-white shadow-sm" : ""
              )}
              style={active ? {} : { color: "var(--text-secondary)" }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = ""; }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Config
          </p>
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === "/dashboard/settings" ? "bg-indigo-600 text-white" : ""}`}
            style={pathname === "/dashboard/settings" ? {} : { color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { if (pathname !== "/dashboard/settings") (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { if (pathname !== "/dashboard/settings") (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <Settings className="w-4 h-4 shrink-0" />
            Connect Sheets
          </Link>
        </div>
      </nav>

      {/* Sheet quick-links */}
      <SheetLinks />

      {/* Bottom: theme toggle */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {theme === "dark" ? "Dark mode" : "Light mode"}
          </p>
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg transition-all"
            style={{ background: "var(--bg-surface)" }}
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <Sun className="w-3.5 h-3.5 text-amber-400" />
              : <Moon className="w-3.5 h-3.5 text-indigo-500" />
            }
          </button>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Desktop sidebar */}
      <aside
        className="w-60 shrink-0 flex-col fixed top-0 bottom-0 left-0 z-30 hidden md:flex"
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}
      >
        <SidebarContent pathname={pathname} theme={theme} toggle={toggle} />
      </aside>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "w-60 shrink-0 flex flex-col fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}
      >
        <SidebarContent
          onClose={() => setSidebarOpen(false)}
          pathname={pathname}
          theme={theme}
          toggle={toggle}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header
          className="flex items-center justify-between px-4 py-3 md:hidden sticky top-0 z-30"
          style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "var(--text-primary)" }}
            aria-label="Open sidebar"
          >
            <span className="text-xl leading-none">☰</span>
          </button>
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Creator Ops</span>
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg transition-all"
            style={{ background: "var(--bg-surface)" }}
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <Sun className="w-3.5 h-3.5 text-amber-400" />
              : <Moon className="w-3.5 h-3.5 text-indigo-500" />
            }
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SheetLinks() {
  if (typeof window === "undefined") return null;
  return <SheetLinksClient />;
}

function SheetLinksClient() {
  const SHEET_LABELS: Record<string, string> = {
    creators: "Creators",
    videos: "Videos",
    performance: "Performance",
    costs: "Costs",
    campaigns: "Campaigns",
  };

  let urls: Record<string, string> = {};
  try {
    const stored = localStorage.getItem("creator_ops_sheet_urls");
    if (stored) urls = JSON.parse(stored);
  } catch {}

  const configured = Object.entries(urls).filter(([, u]) => u?.trim());
  if (!configured.length) return null;

  return (
    <div className="px-3 pb-3" style={{ borderTop: "1px solid var(--border)" }}>
      <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
        Sheets
      </p>
      {configured.map(([key, url]) => (
        <a
          key={key}
          href={url.replace("output=csv", "output=html").split("&single")[0]}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = ""; }}
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          {SHEET_LABELS[key] ?? key}
        </a>
      ))}
    </div>
  );
}
