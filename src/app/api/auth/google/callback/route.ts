import { NextRequest, NextResponse } from "next/server";
import { signSessionToken } from "@/lib/auth";

export const runtime = "nodejs";

const COOKIE_NAME = "wispr_auth";

function isAllowedEmail(email: string): boolean {
  const raw = process.env.ALLOWED_EMAIL_DOMAIN ?? "wispr.ai";
  const allowed = raw.split(",").map((d) => d.trim().toLowerCase());
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return allowed.includes(domain);
}

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleUserInfo {
  email?: string;
  email_verified?: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url));
  }

  const storedState = request.cookies.get("oauth_state")?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=state_mismatch", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://creator-dashboard-steel.vercel.app";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  let tokenData: TokenResponse;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    tokenData = (await tokenRes.json()) as TokenResponse;
  } catch {
    return NextResponse.redirect(new URL("/login?error=token_exchange", request.url));
  }

  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(new URL("/login?error=token_failed", request.url));
  }

  let userInfo: GoogleUserInfo;
  try {
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    userInfo = (await userRes.json()) as GoogleUserInfo;
  } catch {
    return NextResponse.redirect(new URL("/login?error=userinfo_failed", request.url));
  }

  const email = userInfo.email;
  if (!email || !userInfo.email_verified) {
    return NextResponse.redirect(new URL("/login?error=email_unverified", request.url));
  }

  if (!isAllowedEmail(email)) {
    return NextResponse.redirect(new URL("/login?error=unauthorized_domain", request.url));
  }

  const sessionToken = await signSessionToken(email);
  const next = request.cookies.get("login_next")?.value ?? "/dashboard";

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.delete("oauth_state");
  response.cookies.delete("login_next");
  return response;
}
