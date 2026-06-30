import { NextRequest, NextResponse } from "next/server";
import { signSessionToken } from "@/lib/auth";

// Credentials are read from the environment so no production secret lives in source.
const VALID_EMAIL = (process.env.DASHBOARD_EMAIL ?? "shivam@wispr.ai").toLowerCase();
const VALID_PASSWORD = process.env.DASHBOARD_PASSWORD ?? "";
const COOKIE_NAME = "wispr_auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  // Reject all logins when no password is configured rather than allowing a blank match.
  if (
    !VALID_PASSWORD ||
    email?.trim().toLowerCase() !== VALID_EMAIL ||
    password !== VALID_PASSWORD
  ) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionToken = await signSessionToken(VALID_EMAIL);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
