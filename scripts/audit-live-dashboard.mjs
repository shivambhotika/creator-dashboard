// Run: node scripts/audit-live-dashboard.mjs
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

let passed = 0, failed = 0;
function check(name, ok, fix) {
  if (ok) { console.log(`✓ ${name}`); passed++; }
  else { console.error(`✗ ${name}${fix ? `\n  → ${fix}` : ""}`); failed++; }
}

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const mock = read("src/lib/mock-data.ts");
const dubServer = read("src/lib/dub-server.ts");
const envExample = read(".env.example");
const middleware = read("src/middleware.ts");
const sheetsRoute = read("src/app/api/sheets/route.ts");
const attributionLib = read("src/lib/sync/attribution.ts");

const allSrcFiles = walk("src");
const allDocFiles = walk("docs");

// 1. No credentials/secrets in docs/source
const SECRET_PATTERNS = [/Wispr_India_rocks/, /DUB_API_KEY\s*=\s*["'][A-Za-z0-9_-]{12,}["']/, /sk_live_[A-Za-z0-9]+/, /AIza[0-9A-Za-z_-]{30,}/];
const filesToScan = [...allSrcFiles, ...allDocFiles].filter((f) => /\.(ts|tsx|md|mjs|js)$/.test(f));
let secretLeak = null;
for (const f of filesToScan) {
  const content = read(f);
  for (const p of SECRET_PATTERNS) {
    if (p.test(content)) { secretLeak = `${f} matches ${p}`; break; }
  }
  if (secretLeak) break;
}
check("No credentials/secrets in docs/source", secretLeak === null, secretLeak ?? undefined);

// 2. CRON_SECRET documented as required in .env.example
check("CRON_SECRET documented in .env.example", envExample.includes("CRON_SECRET"), "Add CRON_SECRET to .env.example");

// 3. DUB_API_KEY never appears in client component files
const clientFiles = allSrcFiles.filter((f) => /\.(tsx|ts)$/.test(f) && /["']use client["']/.test(read(f)));
const dubInClient = clientFiles.find((f) => read(f).includes("DUB_API_KEY"));
check("DUB_API_KEY never in client component files", !dubInClient, dubInClient ? `Found in ${dubInClient}` : undefined);

// 4. v72/v74/v75 flagged with missingInsightReason or missing URL
check("v72/v74/v75 flagged (missingInsightReason)",
  ["v72", "v74", "v75"].every((id) => {
    const re = new RegExp(`id:\\s*"${id}"[^}]*missingInsightReason`);
    return re.test(mock);
  }),
  "Add missingInsightReason to v72/v74/v75");

// 5. v88 has April go-live date (not June)
check("v88 has April go-live date",
  /id:\s*"v88"[\s\S]{0,300}goLiveDate:\s*"2026-04-25"/.test(mock),
  "Set v88 goLiveDate to 2026-04-25");

// 6. Shared attribution videos do not show exact video CPI
const sharedVideos = ["v87", "v88", "v94", "v7", "v92", "v79", "v89", "v90", "v93"];
const sharedExactBad = sharedVideos.find((id) => {
  const re = new RegExp(`videoIds:\\s*\\[[^\\]]*"${id}"[^\\]]*\\][^}]*exactVideoAttribution:\\s*true`);
  return re.test(dubServer);
});
check("Shared attribution videos are not marked exactVideoAttribution", !sharedExactBad,
  sharedExactBad ? `${sharedExactBad} mapped with exactVideoAttribution: true` : undefined);

// 7. Sheets source IDs allowlisted in /api/sheets/route.ts
check("Sheet source IDs allowlisted in /api/sheets/route.ts",
  sheetsRoute.includes("1f0dAHqqkIv3MiRyKUxrJ7UsXDNOwWyQ7wp8M9_M0hG0") &&
  sheetsRoute.includes("1-il4V8YW8Fob3NMogIm1db7PvBR4PsfAKGXoShWe5N8") &&
  sheetsRoute.includes("ALLOWED_SHEET_IDS"),
  "Ensure ALLOWED_SHEET_IDS contains both spreadsheet IDs");

// 8. Cron routes exist and import CRON_SECRET check
const cronRoutes = ["sync-all", "sync-sheets", "sync-youtube", "sync-dub", "recompute-attribution"];
const cronOk = cronRoutes.every((r) => {
  const c = read(`src/app/api/cron/${r}/route.ts`);
  return c.includes("CRON_SECRET");
});
check("All cron routes exist with CRON_SECRET check", cronOk, "Add CRON_SECRET verification to every cron route");

// 9. Manual sync routes exist
const manualRoutes = ["all", "sheets", "youtube", "dub", "attribution"];
const manualOk = manualRoutes.every((r) => {
  const c = read(`src/app/api/sync/${r}/route.ts`);
  return c.includes("wispr_auth");
}) && existsSync("src/app/api/sync/video/[videoId]/route.ts") && existsSync("src/app/api/sync/creator/[creatorId]/route.ts");
check("Manual sync routes exist with cookie auth", manualOk, "Add all manual sync routes with wispr_auth check");

// 10. storage/index.ts has DB fallback
const storage = read("src/lib/storage/index.ts");
check("storage/index.ts has DB fallback",
  storage.includes("DATABASE_URL") && storage.includes("warnOnce") && storage.includes("postgres"),
  "Implement in-memory fallback in storage/index.ts");

// 11. DUB_LINK_MAPPINGS exists in dub-server.ts
check("DUB_LINK_MAPPINGS exists in dub-server.ts", dubServer.includes("DUB_LINK_MAPPINGS"), "Add DUB_LINK_MAPPINGS export");

// 12. vercel.json has cron config
const vercel = read("vercel.json");
check("vercel.json has cron config", vercel.includes('"crons"') && vercel.includes("/api/cron/sync-all"), "Add cron config to vercel.json");

// 13. .env.example exists with required vars
check(".env.example has required vars",
  ["DUB_API_KEY", "YOUTUBE_API_KEY", "CRON_SECRET", "DATABASE_URL"].every((v) => envExample.includes(v)),
  "Add all required vars to .env.example");

// 14. SKIP_AUTH_IN_DEV guard exists in middleware.ts
check("SKIP_AUTH_IN_DEV guard in middleware.ts",
  middleware.includes("SKIP_AUTH_IN_DEV") && middleware.includes("development"),
  "Guard SKIP_AUTH_IN_DEV to development only");

// 15. Inferred attribution has confidence labels (not "exact" for shared groups)
check("Inferred attribution uses estimated confidence labels",
  attributionLib.includes("high_estimated") && attributionLib.includes("confidenceFromProbability") &&
  !/confidenceFromProbability\([^)]*\)\s*{[^}]*return "exact"/.test(attributionLib.replace(/\s+/g, " ")),
  "Inferred attribution must label shared-group splits as estimated");

// 16. live-metrics.ts exists
check("live-metrics.ts exists", existsSync("src/lib/live-metrics.ts"), "Create src/lib/live-metrics.ts");

// 17. LiveSyncStatus component exists
check("LiveSyncStatus component exists", existsSync("src/components/LiveSyncStatus.tsx"), "Create src/components/LiveSyncStatus.tsx");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
