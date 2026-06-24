import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIX = "/dashboard";
const LOGIN_PATH = "/login";
const COOKIE_NAME = "wispr_auth";

// Cookie value is a simple HMAC-less token — good enough for internal team use.
// Upgrade to JWT + NEXTAUTH_SECRET when Google auth is added.
const VALID_TOKEN = "wispr_india_2026_authed";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let login page + its API through always
  if (pathname === LOGIN_PATH || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Only protect /dashboard routes
  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  // Dev bypass — NEVER set SKIP_AUTH_IN_DEV on Vercel
  if (process.env.SKIP_AUTH_IN_DEV === "true" && process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token === VALID_TOKEN) {
    return NextResponse.next();
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
