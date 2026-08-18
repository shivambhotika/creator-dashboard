import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { DASHBOARD_COOKIE_NAME, LEGACY_DASHBOARD_TOKEN, isDevAuthBypassEnabled } from "@/lib/dashboard-auth";

const PROTECTED_PREFIX = "/dashboard";
const LOGIN_PATH = "/login";

// AUTH DISABLED (2026-08-18): dashboard is open — no login required.
// To re-enable, set AUTH_DISABLED to false.
const AUTH_DISABLED = true;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (AUTH_DISABLED) {
    // Send stray /login visits straight to the dashboard
    if (pathname === LOGIN_PATH) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === LOGIN_PATH || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  // Dev-only bypass — SKIP_AUTH_IN_DEV must ONLY be set in .env.local, never on Vercel.
  if (isDevAuthBypassEnabled()) {
    return NextResponse.next();
  }

  const token = request.cookies.get(DASHBOARD_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Legacy static token — keeps existing sessions valid after the upgrade
  if (token === LEGACY_DASHBOARD_TOKEN) {
    return NextResponse.next();
  }

  // HMAC-signed token from Google OAuth or updated password auth
  const email = await verifySessionToken(token);
  if (email) {
    return NextResponse.next();
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
