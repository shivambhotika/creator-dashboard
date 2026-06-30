"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type CurrencyMode = "usd" | "inr";

interface CurrencyCtx {
  mode: CurrencyMode;
  toggle: () => void;
  /** Format an INR amount → display string */
  money: (inr: number) => string;
  /** Format a per-unit USD rate (CPM, CPC, CPI — already in USD) */
  rate: (usd: number) => string;
  /** Format a raw count (impressions, clicks, installs) */
  count: (n: number) => string;
  /** Format a percentage — same regardless of mode */
  pct: (n: number, decimals?: number) => string;
}

const USD_INR = 84;

function fmtMoney(inr: number, mode: CurrencyMode): string {
  if (mode === "usd") {
    const usd = inr / USD_INR;
    if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
    if (usd >= 1_000)     return `$${(usd / 1_000).toFixed(1)}K`;
    if (usd >= 0.01)      return `$${usd.toFixed(2)}`;
    return `$${usd.toFixed(4)}`; // sub-cent (CPV etc.)
  } else {
    if (inr >= 10_000_000) return `₹${(inr / 10_000_000).toFixed(2)}Cr`;
    if (inr >= 100_000)    return `₹${(inr / 100_000).toFixed(2)}L`;
    if (inr >= 1_000)      return `₹${(inr / 1_000).toFixed(1)}K`;
    if (inr >= 1)          return `₹${inr.toFixed(0)}`;
    return `₹${inr.toFixed(2)}`; // sub-rupee (CPV etc.)
  }
}

function fmtRate(usd: number, mode: CurrencyMode): string {
  if (mode === "usd") return `$${usd.toFixed(2)}`;
  return `₹${(usd * USD_INR).toFixed(0)}`;
}

function fmtCount(n: number, mode: CurrencyMode): string {
  if (mode === "usd") {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
  } else {
    if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`;
    if (n >= 100_000)    return `${(n / 100_000).toFixed(2)}L`;
    if (n >= 1_000)      return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
  }
}

const Ctx = createContext<CurrencyCtx>({
  mode: "usd",
  toggle: () => {},
  money: (inr) => fmtMoney(inr, "usd"),
  rate: (usd) => fmtRate(usd, "usd"),
  count: (n) => fmtCount(n, "usd"),
  pct: (n, d = 1) => `${n.toFixed(d)}%`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<CurrencyMode>("usd");

  useEffect(() => {
    try {
      const s = localStorage.getItem("wispr_currency");
      if (s === "inr" || s === "usd") setMode(s);
    } catch {}
  }, []);

  const toggle = () =>
    setMode((m) => {
      const next = m === "usd" ? "inr" : "usd";
      try { localStorage.setItem("wispr_currency", next); } catch {}
      return next;
    });

  const value: CurrencyCtx = {
    mode,
    toggle,
    money: (inr) => fmtMoney(inr, mode),
    rate: (usd) => fmtRate(usd, mode),
    count: (n) => fmtCount(n, mode),
    pct: (n, d = 1) => `${n.toFixed(d)}%`,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx);
