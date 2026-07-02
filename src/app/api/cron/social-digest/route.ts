import { NextRequest, NextResponse } from "next/server";
import { buildSocialDigest } from "@/lib/social-listening/search";
import { sendSocialDigestToSlack } from "@/lib/social-listening/slack";

export const dynamic = "force-dynamic";

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  return authHeader === `Bearer ${secret}` || querySecret === secret;
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const digest = await buildSocialDigest();
    const slack = await sendSocialDigestToSlack(digest);
    const warnings = slack.warning ? [...digest.warnings, slack.warning] : digest.warnings;
    return NextResponse.json({ ...digest, warnings, sentToSlack: slack.sent });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Social digest failed";
    return NextResponse.json({ error: msg, status: "failed" }, { status: 500 });
  }
}
