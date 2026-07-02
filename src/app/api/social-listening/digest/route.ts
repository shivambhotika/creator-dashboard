import { NextRequest, NextResponse } from "next/server";
import { verifyDashboardRequest } from "@/lib/dashboard-auth";
import { buildSocialDigest } from "@/lib/social-listening/search";
import { sendSocialDigestToSlack } from "@/lib/social-listening/slack";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await verifyDashboardRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const digest = await buildSocialDigest();
    const shouldSend = req.nextUrl.searchParams.get("send") === "1";
    if (!shouldSend) return NextResponse.json(digest);

    const slack = await sendSocialDigestToSlack(digest);
    const warnings = slack.warning ? [...digest.warnings, slack.warning] : digest.warnings;
    return NextResponse.json({ ...digest, warnings, sentToSlack: slack.sent });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Social digest failed";
    return NextResponse.json({ error: msg, status: "failed" }, { status: 500 });
  }
}
