import { NextRequest, NextResponse } from "next/server";

const ALLOWED_SHEET_IDS = [
  "1f0dAHqqkIv3MiRyKUxrJ7UsXDNOwWyQ7wp8M9_M0hG0",  // Finnet Campaign Master Tracker
  "1-il4V8YW8Fob3NMogIm1db7PvBR4PsfAKGXoShWe5N8",  // Wispr × WLDD June 2026 (old)
  "1TcE0qcDlrh1l8MKbAGTtDAzsxCytBo1MHYqDp3taPmg",  // WLDD Master Sheet (WLDD agency — live, maintained)
  "14n9hSSi9J48KvBT4fpliWC-0GAu0hER5",              // Camp India Mastered Data (multi-agency consolidated)
];

export async function GET(req: NextRequest) {
  const sheetId = req.nextUrl.searchParams.get("sheetId");
  const gid = req.nextUrl.searchParams.get("gid") ?? "0";

  if (!sheetId) {
    return NextResponse.json({ error: "sheetId required" }, { status: 400 });
  }

  if (!ALLOWED_SHEET_IDS.includes(sheetId)) {
    return NextResponse.json({ error: "Sheet not in allowlist" }, { status: 403 });
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch sheet" }, { status: res.status });
    }
    const csv = await res.text();
    return new NextResponse(csv, {
      status: 200,
      headers: { "Content-Type": "text/csv" },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
