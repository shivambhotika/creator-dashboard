import { NextRequest, NextResponse } from "next/server";

const VALID_EMAIL = "shivam@wispr.ai";
const VALID_PASSWORD = "Wispr_India_rocks_2026";
const COOKIE_NAME = "wispr_auth";
const COOKIE_VALUE = "wispr_india_2026_authed";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (email?.trim().toLowerCase() !== VALID_EMAIL || password !== VALID_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
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
