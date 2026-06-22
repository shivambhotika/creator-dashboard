import { NextRequest, NextResponse } from "next/server";

/** Fetches a publicly-published Google Sheet CSV and returns it as JSON rows.
 *  The sheet must be published via: File → Share → Publish to web → CSV.
 *  Pass ?url=<published-csv-url> in the query string.
 *  This acts as a proxy so we avoid CORS issues on the client.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing ?url parameter" }, { status: 400 });
  }

  // Only allow Google Sheets domains to prevent SSRF
  const allowed = ["docs.google.com", "spreadsheets.google.com"];
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!allowed.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) {
    return NextResponse.json({ error: "Only Google Sheets URLs are allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    if (!res.ok) {
      return NextResponse.json({ error: `Sheet fetch failed: ${res.status}` }, { status: 502 });
    }

    const text = await res.text();
    const rows = parseCsv(text);

    return NextResponse.json({ rows }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch sheet" }, { status: 500 });
  }
}

/** Minimal CSV parser that handles quoted fields. */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = splitRow(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = splitRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = (vals[i] ?? "").trim(); });
    return row;
  });
}

function splitRow(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuote = !inQuote; }
    } else if (ch === "," && !inQuote) {
      result.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}
