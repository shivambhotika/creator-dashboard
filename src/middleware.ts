import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const PROTECTED_PREFIX = "/dashboard";
const LOGIN_PATH = "/login";
const COOKIE_NAME = "wispr_auth";
const LEGACY_TOKEN = "wispr_india_2026_authed";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === LOGIN_PATH || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  // Dev-only bypass — SKIP_AUTH_IN_DEV must ONLY be set in .env.local, never on Vercel.
  const isProduction = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  if (
    process.env.SKIP_AUTH_IN_DEV === "true" &&
    process.env.NODE_ENV === "development" &&
    !isProduction
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Legacy static token — keeps existing sessions valid after the upgrade
  if (token === LEGACY_TOKEN) {
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
