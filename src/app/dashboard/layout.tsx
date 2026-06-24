"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Video, BarChart2,
  DollarSign, ExternalLink, Sun, Moon, Settings, CalendarDays, X, Menu, FileSpreadsheet, LogOut,
} from "lucide-react";

const nav = [
  { href: "/dashboard",             label: "Overview",     icon: LayoutDashboard },
  { href: "/dashboard/creators",    label: "Creators",     icon: Users },
  { href: "/dashboard/videos",      label: "Videos",       icon: Video },
  { href: "/dashboard/calendar",    label: "Calendar",     icon: CalendarDays },
  { href: "/dashboard/performance", label: "Performance",  icon: BarChart2 },
  { href: "/dashboard/costs",       label: "Costs & ROI",  icon: DollarSign },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100 font-medium",
        active
          ? "text-white"
          : "hover:bg-[var(--bg-surface)]"
      )}
      style={
        active
          ? { background: "var(--accent)", color: "#fff" }
          : { color: "var(--text-secondary)" }
      }
    >
      <Icon
        className="w-4 h-4 shrink-0 transition-colors"
        style={active ? { color: "#fff" } : { color: "var(--text-muted)" }}
      />
      {label}
    </Link>
  );
}

function SidebarContent({ onClose, pathname, theme, toggle }: {
  onClose?: () => void;
  pathname: string;
  theme: string;
  toggle: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Wordmark */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <Video className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Creator Ops
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md md:hidden transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-1.5 label-caps">Analytics</p>
        {nav.map(({ href, label, icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={pathname === href}
            onClick={onClose}
          />
        ))}

        <div className="pt-4">
          <p className="px-3 mb-1.5 label-caps">Resources</p>
          <NavItem
            href="/dashboard/sheets"
            label="Sheet Links"
            icon={FileSpreadsheet}
            active={pathname === "/dashboard/sheets"}
            onClick={onClose}
          />
          <NavItem
            href="/dashboard/settings"
            label="Connect Sheets"
            icon={Settings}
            active={pathname === "/dashboard/settings"}
            onClick={onClose}
          />
        </div>
      </nav>

      {/* Sheet quick-links */}
      <SheetLinks />

      {/* Bottom bar: theme toggle + sign out */}
      <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={toggle}
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
          style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}
          aria-label="Toggle theme"
        >
          {theme === "dark"
            ? <Sun className="w-3.5 h-3.5 text-amber-400" />
            : <Moon className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          }
        </button>
        <span className="label-caps flex-1 text-center">{theme === "dark" ? "Dark" : "Light"}</span>
        <SignOutButton />
      </div>
    </div>
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
        className="w-56 shrink-0 fixed top-0 bottom-0 left-0 z-30 hidden md:block"
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}
      >
        <SidebarContent pathname={pathname} theme={theme} toggle={toggle} />
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "w-56 fixed top-0 bottom-0 left-0 z-50 transition-transform duration-200 md:hidden",
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

      {/* Main */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header
          className="flex items-center justify-between px-4 h-12 md:hidden sticky top-0 z-30"
          style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Open sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Creator Ops</span>
          <button
            onClick={toggle}
            className="w-7 h-7 flex items-center justify-center rounded-md"
            style={{ background: "var(--bg-surface)" }}
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <Sun className="w-3.5 h-3.5 text-amber-400" />
              : <Moon className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
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

function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
  }
  return (
    <button
      onClick={signOut}
      className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
      style={{ color: "var(--text-muted)" }}
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="w-3.5 h-3.5" />
    </button>
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
    <div className="px-2 pb-2" style={{ borderTop: "1px solid var(--border)" }}>
      <p className="px-3 pt-3 mb-1.5 label-caps">Sheets</p>
      {configured.map(([key, url]) => (
        <a
          key={key}
          href={url.replace("output=csv", "output=html").split("&single")[0]}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "";
          }}
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          {SHEET_LABELS[key] ?? key}
        </a>
      ))}
    </div>
  );
}
