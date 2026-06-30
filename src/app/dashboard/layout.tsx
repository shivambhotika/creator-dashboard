"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Video, BarChart2,
  DollarSign, ExternalLink, Sun, Moon, Settings, CalendarDays, X, Menu,
  FileSpreadsheet, LogOut, Building2, ShieldAlert, Target,
} from "lucide-react";
import { CurrencyToggle } from "@/components/CurrencyToggle";

const NAV_ANALYTICS = [
  { href: "/dashboard",             label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/creators",    label: "Creators",    icon: Users },
  { href: "/dashboard/videos",      label: "Videos",      icon: Video },
  { href: "/dashboard/calendar",    label: "Calendar",    icon: CalendarDays },
  { href: "/dashboard/performance", label: "Performance", icon: BarChart2 },
  { href: "/dashboard/costs",       label: "Costs & ROI", icon: DollarSign },
  { href: "/dashboard/agency",      label: "Agencies",    icon: Building2 },
  { href: "/dashboard/decision",    label: "Decision",    icon: Target },
  { href: "/dashboard/data-health", label: "Data Health", icon: ShieldAlert },
];

const NAV_RESOURCES = [
  { href: "/dashboard/sheets",   label: "Sheet Links",    icon: FileSpreadsheet },
  { href: "/dashboard/settings", label: "Connect Sheets", icon: Settings },
];

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p
        className="px-3 pt-3 pb-1.5"
        style={{
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

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
        "group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
        active ? "" : "hover:bg-[var(--bg-surface)]"
      )}
      style={
        active
          ? {
              background: "var(--accent-gradient)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(99,102,241,0.32)",
            }
          : { color: "var(--text-secondary)" }
      }
    >
      <Icon
        className="w-4 h-4 shrink-0"
        style={{ color: active ? "rgba(255,255,255,0.85)" : "var(--text-muted)" }}
      />
      {label}
    </Link>
  );
}

function SidebarContent({
  onClose,
  pathname,
  theme,
  toggle,
}: {
  onClose?: () => void;
  pathname: string;
  theme: string;
  toggle: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Wordmark */}
      <div
        className="flex items-center justify-between px-4 h-[60px] shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--accent-gradient)",
              boxShadow: "0 3px 10px rgba(99,102,241,0.35)",
            }}
          >
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <p
              className="text-sm font-bold leading-tight tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Creator Ops
            </p>
            <p style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Wispr India
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg md:hidden transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <NavGroup label="Analytics">
          {NAV_ANALYTICS.map(({ href, label, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname === href}
              onClick={onClose}
            />
          ))}
        </NavGroup>

        <NavGroup label="Resources">
          {NAV_RESOURCES.map(({ href, label, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname === href}
              onClick={onClose}
            />
          ))}
        </NavGroup>

        <SheetLinks onClose={onClose} />
      </nav>

      {/* Bottom bar */}
      <div
        className="px-3 py-3 flex items-center gap-2"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <CurrencyToggle />
        <div className="flex-1" />
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 btn-nm"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          )}
        </button>
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
        className="w-58 shrink-0 fixed top-0 bottom-0 left-0 z-30 hidden md:block"
        style={{
          width: "230px",
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        <SidebarContent pathname={pathname} theme={theme} toggle={toggle} />
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 transition-transform duration-200 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          width: "230px",
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        <SidebarContent
          onClose={() => setSidebarOpen(false)}
          pathname={pathname}
          theme={theme}
          toggle={toggle}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 0 }}>
        {/* Mobile topbar */}
        <header
          className="flex items-center justify-between px-4 h-14 md:hidden sticky top-0 z-30"
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl btn-nm"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Open sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-gradient)" }}
            >
              <Video className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Creator Ops
            </span>
          </div>
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-xl btn-nm"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            )}
          </button>
        </header>

        <main className="flex-1 overflow-auto md:ml-[230px]">{children}</main>
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
      className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 btn-nm"
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
    </button>
  );
}

function SheetLinks({ onClose }: { onClose?: () => void }) {
  if (typeof window === "undefined") return null;
  return <SheetLinksClient onClose={onClose} />;
}

function SheetLinksClient({ onClose }: { onClose?: () => void }) {
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
    <NavGroup label="Sheets">
      {configured.map(([key, url]) => (
        <a
          key={key}
          href={url.replace("output=csv", "output=html").split("&single")[0]}
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "";
          }}
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
          {SHEET_LABELS[key] ?? key}
        </a>
      ))}
    </NavGroup>
  );
}
