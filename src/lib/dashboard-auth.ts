import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export const DASHBOARD_COOKIE_NAME = "wispr_auth";
export const LEGACY_DASHBOARD_TOKEN = "wispr_india_2026_authed";

export function isDevAuthBypassEnabled(): boolean {
  const isProduction = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  return (
    process.env.SKIP_AUTH_IN_DEV === "true" &&
    process.env.NODE_ENV === "development" &&
    !isProduction
  );
}

export async function verifyDashboardRequest(request: NextRequest): Promise<boolean> {
  if (isDevAuthBypassEnabled()) return true;

  const token = request.cookies.get(DASHBOARD_COOKIE_NAME)?.value;
  if (!token) return false;
  if (token === LEGACY_DASHBOARD_TOKEN) return true;

  return (await verifySessionToken(token)) != null;
}
