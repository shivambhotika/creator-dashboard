"use client";

import { ThemeProvider } from "./ThemeProvider";
import { CurrencyProvider } from "@/lib/currency-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </ThemeProvider>
  );
}
