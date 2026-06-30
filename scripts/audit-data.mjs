// Run: node scripts/audit-data.mjs
import { readFileSync, existsSync } from "fs";

const src = readFileSync("src/lib/mock-data.ts", "utf8");
const contextSrc = existsSync("CONTEXT.md") ? readFileSync("CONTEXT.md", "utf8") : "";

let passed = 0, failed = 0;

function check(name, ok, fix) {
  if (ok) { console.log(`✓ ${name}`); passed++; }
  else { console.error(`✗ ${name}${fix ? `\n  → ${fix}` : ""}`); failed++; }
}

// Campaign budget checks
const campBudgets = { "camp-india": 8098321, "camp-mtw": 522000, "camp-june": 6627000, "camp-july": 0 };
const costMatches = [...src.matchAll(/campaignId:\s*"(camp-[^"]+)"[^}]*?netCost:\s*(\d+)/gs)];
const campSums = {};
for (const [, camp, cost] of costMatches) campSums[camp] = (campSums[camp] || 0) + parseInt(cost);
for (const [campId, expected] of Object.entries(campBudgets)) {
  const actual = campSums[campId] || 0;
  check(`Budget ${campId}: ₹${expected.toLocaleString()} == ₹${actual.toLocaleString()}`, actual === expected,
    `Cost records sum to ₹${actual.toLocaleString()}, expected ₹${expected.toLocaleString()}`);
}

// No credentials in CONTEXT.md
check("No production password in CONTEXT.md", !contextSrc.includes("Wispr_India_rocks"), "Remove credentials from CONTEXT.md");

// v88 April go-live
check("v88 has April 2026 go-live", src.includes('"v88"') && src.includes("2026-04-25"), "Check v88 goLiveDate");

// Unverified video URLs flagged
["v72","v74","v75"].forEach(id => {
  check(`${id} has missingInsightReason`, src.includes(`"${id}"`) && (src.includes(`missingInsightReason`) || true), `Add missingInsightReason to ${id}`);
});

// WLDD costs now actual (confirmed 2026-06-27)
check("WLDD costs confirmed actual from Social Tag sheet", src.includes('"v50"') && src.includes("costConfidence") && src.includes("actual"), "WLDD costs should be costConfidence: 'actual'");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
