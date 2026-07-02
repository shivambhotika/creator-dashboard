# Wispr India Creator Ops — Full Context & Change Log

> **Last updated:** 2026-07-02
> **Repo:** github.com/shivambhotika/creator-dashboard
> **Production:** https://creator-dashboard-steel.vercel.app
> **Stack:** Next.js 16.2.9 (App Router) · TypeScript · Tailwind · Vercel

---

## 1. What This Dashboard Is

Internal tool for Wispr India's creator marketing team. Tracks ~35 YouTube/Instagram/LinkedIn creators across spend, installs, CPI, CPV, and attribution. Data sources:

- **Mock/seed data** (`src/lib/mock-data.ts`) — current seeded baseline and fallback for creator, video, cost, performance, install records
- **Postgres snapshots** (`src/lib/storage/index.ts`) — intended persistent source for sync history, YouTube snapshots, Dub snapshots, and inferred attribution when `DATABASE_URL` is set
- **Dub.co** — live click + install (lead) tracking via unique per-video slugs
- **Google Sheets** — syncs creator/video metadata
- **YouTube Data API v3** — syncs view counts (10k units/day; all ~35 videos = 1 unit per run)

Product direction: move operational truth from static seed arrays into persistent imported/synced records, while keeping seed data as a safe fallback for local development and demos.

---

## 2. Core Constants & Calculations

| Constant | Value | Notes |
|---|---|---|
| `USD_INR` | `84` | Hard-coded across entire codebase — never changes mid-session |
| `ACTIVE_DAYS` | `10` | Days after go-live a video counts as "Active" |
| `HIGH_PRIORITY_COUNT` | `3` | P0 + P1 open action items (compile-time constant from `src/lib/action-items.ts`) |

### CPI
- **Always stored in INR** (`netCost ÷ installs` where `netCost` is INR)
- Divide by 84 to display in USD
- `~` prefix shown when no Dub link exists (inferred/manual data)
- Thresholds: ≤₹300 green · ≤₹600 amber · above red

### Monthly CPI (Campaign Batch Efficiency)
- Groups videos by `goLiveDate` month
- Computes `sum(netCost) / sum(installs)` per cohort
- Only months with `netCost > 0` AND `installs > 0` are meaningful
- Used in Overview sparkline + Costs page strip

### Attribution
- **Dub present** → measured/high-confidence → show value as-is
- **Dub absent** → manual/estimated → show `~` prefix with tooltip
- Shared attribution groups (Ishan, Anurag, Nandini etc.) → CPI shown at creator level only, not video

### Renewals Logic (Decision page)
| CPI (USD) | Recommendation |
|---|---|
| < $5 | Renew strongly |
| $5–$15 | Renew if price holds |
| $15–$30 | Renegotiate price |
| > $30 | Do not renew |
| Shared attribution | Fix attribution first |
| 0 installs | Insufficient data |

---

## 3. Auth Architecture

### Two auth paths
1. **Password login** (`/api/auth/login`) — `DASHBOARD_PASSWORD` env var, issues HMAC-signed session token
2. **Google OAuth** (`/api/auth/google` → `/api/auth/google/callback`) — restricted to `ALLOWED_EMAIL_DOMAIN` (default: `wispr.ai`)

### Session tokens
- HMAC-SHA256, Web Crypto API (Edge Runtime + Node.js compatible)
- Format: `base64(email|expires).hexsig`
- 30-day expiry
- Cookie name: `wispr_auth`
- Legacy static token `wispr_india_2026_authed` still accepted for backward compat

### Proxy (auth guard)
- `src/proxy.ts` (was `middleware.ts` — renamed per Next.js 16 deprecation)
- Export name: `proxy` (not `middleware`)
- Protects all `/dashboard/*` routes
- `SKIP_AUTH_IN_DEV=true` bypasses auth in dev only — **NEVER set this on Vercel**

---

## 4. File Map — Key Files

```
src/
├── proxy.ts                              ← Auth guard (was middleware.ts, renamed Next.js 16)
├── lib/
│   ├── mock-data.ts                      ← ALL creator/video/cost/perf/install data
│   ├── action-items.ts                   ← P0/P1/P2 open action items + HIGH_PRIORITY_COUNT
│   ├── auth.ts                           ← HMAC session token sign/verify
│   ├── dub-server.ts                     ← Live Dub API fetch (server-side only)
│   ├── attribution.ts                    ← Shared attribution group definitions
│   ├── storage/index.ts                  ← DB (Neon/Postgres) with in-memory fallback
│   └── youtube.ts                        ← YouTube Data API v3 helper
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                      ← Overview server component — computes monthCPIs, freshness
│   │   ├── layout.tsx                    ← Sidebar, ⌘K button, CommandPalette, Decision badge
│   │   ├── decision/page.tsx             ← Decision Center — imports from action-items.ts
│   │   ├── creators/
│   │   │   ├── page.tsx                  ← Wrapped in <Suspense> (required for useSearchParams)
│   │   │   └── CreatorsClient.tsx        ← CSV export, reads ?search= URL param
│   │   ├── videos/
│   │   │   ├── page.tsx                  ← Wrapped in <Suspense>
│   │   │   └── VideosClient.tsx          ← TODAY = new Date() (was hardcoded bug)
│   │   ├── performance/
│   │   │   ├── page.tsx                  ← Wrapped in <Suspense>
│   │   │   └── (PerformanceClient in src/components/)
│   │   ├── costs/page.tsx
│   │   └── agency/AgencyClient.tsx       ← Agency list derived from data (not hardcoded)
│   └── api/
│       ├── auth/google/route.ts          ← OAuth initiation
│       ├── auth/google/callback/route.ts ← OAuth callback, email domain check
│       ├── auth/login/route.ts           ← Password auth + DELETE (sign out)
│       └── cron/                         ← YouTube/Dub/Sheets sync cron handlers
└── components/
    ├── OverviewClient.tsx                ← Freshness bar, Decision callout, CPI trend section
    ├── CommandPalette.tsx                ← ⌘K search — indexes creators/videos/agencies
    ├── Sparkline.tsx                     ← Pure SVG sparkline, invertTrend=true for CPI
    ├── StatCard.tsx                      ← Neomorphic raised card with gradient icon badge
    ├── CostsClient.tsx                   ← CPI sparkline strip above charts
    └── PerformanceClient.tsx             ← ~ prefix on inferred installs/CPI
```

---

## 5. UI Design System

**Neomorphism** — cards and page background share the same color; depth from dual box-shadows.

```css
:root {
  --bg-base: #eaebf5;
  --bg-card: #eaebf5;          /* SAME as base — neomorphic */
  --nm-raised: 7px 7px 16px rgba(158,160,200,0.65), -7px -7px 16px rgba(255,255,255,0.98);
  --nm-sm:    4px 4px 10px rgba(158,160,200,0.55), -4px -4px 10px rgba(255,255,255,0.9);
  --nm-inset: inset 3px 3px 8px rgba(158,160,200,0.5), inset -3px -3px 8px rgba(255,255,255,0.8);
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #818cf8 60%, #a78bfa 100%);
}
html.dark {
  --bg-base: #10101e;
  --bg-card: #10101e;
}
```

**CSS Classes:** `.card` · `.card-sm` · `.card-inset` · `.btn-nm` · `.btn-accent` · `.section-heading` · `.nm-input`

---

## 6. Data — Video Status Corrections

| Video | Creator | Status | Notes |
|---|---|---|---|
| v63 | Full Disclosure | **Live** | Dub URL: `ref.wisprflow.ai/fulldisclosureyt`. Went live 2026-06-30 |
| v72 | Sheryians Coding | Live | No confirmed video URL — view count from sheet, URL unverified |
| v74 | Arsh Goyal | **Scheduled** | Not yet live. Performance data zeroed out |
| v75 | Code And Bug | Live | No confirmed video URL — view count from sheet, URL unverified |

---

## 7. Open Action Items (from `src/lib/action-items.ts`)

| Priority | Item |
|---|---|
| P0 | Create unique Dub slugs per video for Ishan, Nandini, Anurag before next deal cycle |
| P1 | Confirm actual video URLs for v72 (Sheryians), v74 (Arsh Goyal), v75 (Code And Bug) |
| P2 | Request per-post breakdown for Anurag Bansal v93 (IG Reel 2) — aggregated with v79 |
| P2 | Separate v88 Ishan April video from June reporting (use contracted spend basis) |
| P2 | Connect revenue/LTV data to enable ROAS calculation |

---

## 8. Environment Variables

### Security note — immediate action
Real API credentials were previously documented in this context file. Treat those values as exposed because this repo is on GitHub:

- Rotate the Dub API key.
- Rotate the YouTube API key.
- Rotate the Google OAuth client secret.
- Regenerate `NEXTAUTH_SECRET`.
- Re-check Vercel env vars after rotation.

No real secrets should appear in `context.md`, README, source, or docs. Use `.env.example` placeholders only.

### Local (`.env.local` only — never commit)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
SKIP_AUTH_IN_DEV=true
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
ALLOWED_EMAIL_DOMAIN=wispr.ai
YOUTUBE_API_KEY=<youtube-data-api-key>
DUB_API_KEY=<dub-api-key>
DASHBOARD_EMAIL=shivam@wispr.ai
DASHBOARD_PASSWORD=<local-dashboard-password>
CRON_SECRET=<random-cron-secret>
DATABASE_URL=<postgres-url-optional-locally>
SNAPSHOT_STORAGE_FILE=.data/creator-dashboard-storage.json
```

### Vercel (production — must be set manually in dashboard)
| Variable | Value |
|---|---|
| `NEXTAUTH_URL` | `https://creator-dashboard-steel.vercel.app` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in terminal |
| `DASHBOARD_PASSWORD` | Your chosen login password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ALLOWED_EMAIL_DOMAIN` | `wispr.ai` |
| `YOUTUBE_API_KEY` | YouTube Data API key |
| `DUB_API_KEY` | Dub API key |
| `CRON_SECRET` | Random secret required by `/api/cron/*` routes |
| `DATABASE_URL` | Postgres/Neon URL for persistent snapshots and sync history |

> ⚠️ `SKIP_AUTH_IN_DEV` must **NEVER** be set on Vercel — it disables all authentication.
> Local development can use `SNAPSHOT_STORAGE_FILE`; production should use `DATABASE_URL` for durable persistence.

---

## 9. Google Cloud Console Setup

- Project: `india-creator-dashboard`
- **Authorized JavaScript origins** (no trailing slash, no path):
  - `https://creator-dashboard-steel.vercel.app`
  - `http://localhost:3000`
- **Authorized redirect URIs** (with path):
  - `https://creator-dashboard-steel.vercel.app/api/auth/google/callback`
  - `http://localhost:3000/api/auth/google/callback`

---

## 10. Full Commit History

| Commit | Description |
|---|---|
| `5f1b36f` | Data corrections (Full Disclosure live + Dub URL, Arsh Goyal scheduled, v74 data zeroed), CPI sparkline on Costs, Performance search URL params |
| `b770431` | Fix build errors — Suspense wrappers for `useSearchParams`, `middleware.ts` → `proxy.ts` |
| `edbf052` | Overview freshness bar + Decision callout + CPI trend section; Decision page dark mode fix; `~` prefix on inferred metrics; ⌘K search auto-populates Creators/Videos |
| `7ef6ce7` | Full neomorphism UI rehaul — design system, StatCard, CommandPalette, Sparkline, sidebar gradient nav, Decision badge |
| `7a49b13` | Google OAuth (server-side code flow), HMAC-SHA256 session tokens, YouTube API key wired, login page Google button |
| `192357f` | Currency toggle (INR/USD), agency page, platform MoM breakdown table, CPM/CPC/CPI calculation bug fixes |
| `f672d4d` | Overview page overhaul, calendar metrics, agency sheet templates |
| `4763209` | Owled data enriched, agency list fixes, video Activity column (Active/Exhausted/Upcoming) |
| `67ba437` | Live Dub API wired to dashboard, Coding First costs added (₹1.18M) |
| `212b53f` | Initial commit |

---

## 11. Bugs Fixed

| Bug | Fix |
|---|---|
| `TODAY` hardcoded `"2026-06-25"` in VideosClient — Activity column wrong for all videos | `new Date().toISOString().slice(0, 10)` |
| Agency page missing WLDD (17 creators), Discovr, Creator Dream, Palak, LinkedIn Seeding | Derived agency list dynamically from `creators` array, not hardcoded |
| Decision page hardcoded amber/green backgrounds broke dark mode | CSS variable + `rgba` opacity instead |
| Action items duplicated inline in Decision page — no single source of truth | Extracted to `src/lib/action-items.ts`, imported everywhere |
| `middleware.ts` deprecated in Next.js 16 — build warning | Renamed to `proxy.ts`, export renamed from `middleware` to `proxy` |
| `useSearchParams()` without Suspense crashed production build | Wrapped Creators, Videos, Performance pages in `<Suspense>` |
| Vercel deploys blocked — git author `shivambhotika@Shivams-MacBook-Air.local` not in Vercel team | `git config --global user.email "shivam.bhotika@gmail.com"` then force-pushed |
| CPI inferred from manual data shown without confidence signal | `~` prefix + tooltip on installs/CPI when `dubByVideo[videoId]` absent |
| `fromHex` in `auth.ts` returning `Uint8Array` incompatible with `crypto.subtle.verify` | Changed to return `ArrayBuffer` via `DataView` |
| Full Disclosure v63 shown as a critical Dub slug conflict after a unique URL existed | Added `fulldisclosureyt` to Dub mappings, marked the issue/action resolved |
| Missing `DATABASE_URL` showed as a hard critical even when local sync could still run | Added JSON snapshot-file fallback plus storage-status UI copy |

---

## 12. What's Still Pending

- Rotate all previously exposed external secrets, then update local/Vercel env vars.
- Connect revenue/LTV data → enables ROAS across all pages
- Set Vercel env vars (see Section 8)
- Add Google OAuth redirect URIs (see Section 9)
- Confirm live URLs for v72 (Sheryians), v74 (Arsh Goyal), v75 (Code And Bug) when they go live
- Create unique Dub slugs for Ishan, Nandini, Anurag (P0)

---

## 13. Change Log — 2026-07-02

- Renamed the canonical project memory file to `context.md` for cross-agent consistency.
- Removed real credential values from committed context and added `.env.example` placeholders.
- Documented required secret rotation for previously exposed Dub, YouTube, Google OAuth, and session secrets.
- Added shared dashboard auth for internal APIs, repaired the Sheets setup flow, and consolidated stale docs into `context.md`.
- Removed the external Google Fonts build dependency and set `npm run build` to `next build --webpack` after Turbopack hit a local sandbox port-binding panic.
- Removed unused `next-auth` dependency; auth remains custom HMAC cookie-based via `src/lib/auth.ts` and `src/lib/dashboard-auth.ts`.
- Hardened `scripts/audit-live-dashboard.mjs` so it scans root docs (`context.md`, README, agent docs) for real credential patterns.
- Added `tsconfig.typecheck.json` so standalone `npm run typecheck` stays source-scoped; generated Next route types are validated by `next build`.
- Verification after changes:
  - `npm run lint` passes.
  - `npm run typecheck` passes when run sequentially.
  - `npm run build` passes using webpack.
  - `npm run audit:data` passes.
  - `npm run audit:live` passes.
  - `npm audit --omit=dev` still reports 2 moderate `postcss` advisories through Next.js with no direct fix available from npm audit.

### Usability + Critical Issue Pass — 2026-07-02

- Resolved the Full Disclosure critical alert by mapping `v63` to unique Dub slug `fulldisclosureyt` and marking the old conflict action as resolved.
- Added local JSON snapshot fallback through `SNAPSHOT_STORAGE_FILE` so local sync runs/snapshots can persist without Postgres; Vercel production should still use `DATABASE_URL`.
- Added action-first Overview “Today” workflow cards for attribution fixes, renewal review, live-link checks, and data refresh.
- Added reusable `src/lib/insights.ts` intelligence layer to compute source coverage, platform precision, and operator insights from the current dataset + Dub availability.
- Added protected `GET /api/insights` endpoint for other agents/platforms to consume the same dashboard intelligence without scraping UI.
- Added Overview “Operator Insights” and “Data Precision” sections so the most relevant data/API conclusions are visible on first load.
- Added Data Health “Source Coverage” and “Platform Precision” sections for debugging which calculations are precise enough to trust.
- Added metric explanation tooltips, trust/confidence badges, saved views, smart filters, and click-through detail drawers for creator/video review.
- Expanded Command Palette search across pages, campaigns, agencies, creators, videos, open data issues, action items, and Dub slugs.
- Added diagnostic Performance charts: funnel leakage, CPI driver map, and launch velocity.
- Made Decision Center more opinionated with a renewal board and next budget moves before the detailed matrix.
