# Wispr India Creator Dashboard — Agent Context

> Internal reference doc for agents and team members continuing work on this dashboard.
> Last updated: 2026-06-22

---

## What This Is

A Next.js App Router dashboard tracking Wispr Flow's India creator marketing campaigns.
It is **password-protected** (internal team use only) and deployed on Vercel.

**Live URL:** https://creator-dashboard-steel.vercel.app
**Login:** shivam@wispr.ai / see .env.local (never commit the password)

---

## Campaign Structure

### 3 Active + 1 Planned

| ID | Name | Budget (INR) | Status | Creators |
|---|---|---|---|---|
| `camp-india` | Wispr India Launch | ₹54,91,601 | Ended | c1–c31 |
| `camp-mtw` | Mumbai Tech Week | ₹5,22,000 | Ended | c32–c49 |
| `camp-june` | June 2026 | ₹11,82,000 | Active | c50–c76 |
| `camp-july` | July 2026 | ₹0 | Planned | TBD |

### Budget Breakdown for `camp-india`
- Finnet (c1–c7): ₹13,47,000
- AEOS/AOS (c8–c10): ₹9,59,280 (11,420 USD × ₹84)
- Owled (c11–c20): ₹31,85,321
- LinkedIn Seeding (c21–c31): ₹0
- **Total: ₹54,91,601**

### USD → INR conversion
`USD_INR = 84` — defined as a constant in `src/lib/mock-data.ts`

---

## Agencies

| Agency | Creators | Notes |
|---|---|---|
| Finnet | c1–c7 | Direct agency partnership |
| AEOS | c8–c10 | Previously listed as "AOS" — correct name is AEOS |
| Owled | c11–c20 | Real view data loaded from Sheet 4 |
| Social Tag | c21–c66 | LinkedIn seeding + WLDD creators |
| Direct | c67–c76 | Coding First — no agency, direct deal |

**"Coding First" is a creator category, not an agency.** Direct deals.

---

## Video Status System

Two separate dimensions:

### `status` (delivery state)
- `"Live"` — video is published
- `"Scheduled"` — not yet live

### `activity` (computed at runtime, not stored)
Computed in `src/app/dashboard/videos/page.tsx`:
- **Active** — went live within the last 10 days of dashboard reference date
- **Exhausted** — went live more than 10 days ago
- **Upcoming** — status is "Scheduled"

Reference date constant: `TODAY = "2026-06-22"` (update manually or make dynamic)

---

## Live Data: Dub Analytics

Wispr uses [Dub](https://dub.co) for link tracking (domain: `ref.wisprflow.ai`).

**Server-side only.** Key lives in `.env.local` as `DUB_API_KEY` — never exposed to browser.

File: `src/lib/dub-server.ts`

Endpoint: `GET https://api.dub.co/analytics?domain=ref.wisprflow.ai&key={SLUG}&event=composite`

Returns: `{ clicks, leads, sales, saleAmount }`

Active slugs (as of 2026-06-22):
```
v50: infobyshree       v51: insta-nirav      v52: kochu-ai
v53: financewithjobi   v54: prettymuchbusiness v55: applewale-bhaiya
v56: ezsnippet         v57: vaibhavkadnar    v58: bisboworld
v59: akbershaikh       v60: WhyBhanshu       v67: codingwithsagar
v68: nishantchahar     v69: saumyasingh      v70: pavanlalwani
v71: mehulmpt          v73: engineeringdigest v74: arshgoyal
v75: codeandbug        v76: astrokj          v35: suryakant-chaurasiya
```

---

## Google Sheets

Source of truth for creator data. Sheets are fetched via the gviz API (no auth needed for public sheets):
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={TAB_NAME}
```

**Connected sheets so far:**
- Sheet 4 (Owled data) — ID: `1b13aZcqM5q82Hm9KQLKxDVwdVWxdguiBxxgJLrpYzp8`

Other sheet URLs are pending — user will provide them. Add to `/dashboard/sheets` page.

**Do not modify or delete Google Drive files.** Dashboard reads only.

---

## Auth System

Cookie-based, no NextAuth yet.

| File | Purpose |
|---|---|
| `src/middleware.ts` | Protects `/dashboard/*`, redirects to `/login` |
| `src/app/login/page.tsx` | Login UI with Wispr India branding |
| `src/app/api/auth/login/route.ts` | POST to authenticate, DELETE to sign out |

Cookie: `wispr_auth=wispr_india_2026_authed` (httpOnly, 30-day expiry)

**Dev bypass:** `SKIP_AUTH_IN_DEV=true` in `.env.local` skips auth in development.
**NEVER set `SKIP_AUTH_IN_DEV` on Vercel.** It would make the dashboard public.

**Planned:** Google OAuth via NextAuth — restrict to @wispr.ai domain via `ALLOWED_EMAIL_DOMAIN`.

---

## File Map

```
src/
├── lib/
│   ├── mock-data.ts        ← All creator, video, performance, cost, campaign data (~1100 lines)
│   ├── dub-server.ts       ← Server-side Dub analytics fetcher
│   ├── utils.ts            ← formatNumber, formatCurrency, formatDate, cn()
│   └── badges.ts           ← Badge CSS classes by type
├── types/index.ts          ← TypeScript types: Creator, Video, Campaign, etc.
├── components/
│   ├── StatCard.tsx        ← Metric cards (label-caps + stat-number style)
│   ├── OverviewCharts.tsx  ← Area chart (installs trend) + Donut (platform) + Horizontal bar (CPI)
│   ├── SortableTable.tsx   ← Generic sortable table component
│   ├── Badge.tsx           ← Pill badge component
│   ├── ThemeProvider.tsx   ← Dark/light mode context
│   └── Providers.tsx       ← Wraps ThemeProvider
├── app/
│   ├── layout.tsx          ← Root layout
│   ├── login/page.tsx      ← Login page
│   ├── api/auth/login/
│   │   └── route.ts        ← POST (login) / DELETE (sign out)
│   └── dashboard/
│       ├── layout.tsx      ← Sidebar navigation
│       ├── page.tsx        ← Overview (async, fetches live Dub data)
│       ├── creators/       ← Creator roster table
│       ├── videos/         ← Video table with Activity column
│       ├── calendar/       ← Go-live calendar view
│       ├── performance/    ← Performance charts
│       ├── costs/          ← Cost & ROI analysis
│       ├── sheets/         ← Sheet links reference page
│       └── settings/       ← Connect Sheets UI
├── middleware.ts           ← Auth guard for /dashboard/*
```

---

## Design System

Token-based via CSS variables in `src/app/globals.css`.

### Colors (dark mode)
| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#07070f` | Page background |
| `--bg-card` | `#0f0f1a` | Card surfaces |
| `--bg-surface` | `#14141f` | Input backgrounds, pill buttons |
| `--bg-elevated` | `#1a1a28` | Elevated cards |
| `--border` | `#1e1e2e` | Borders |
| `--text-primary` | `#ededf5` | Main text |
| `--text-secondary` | `#8888a8` | Labels, subtitles |
| `--text-muted` | `#44445a` | Timestamps, hints |
| `--accent` | `#6366f1` | Indigo — active nav, buttons, links |

### Typography utilities
- `.label-caps` — 0.65rem, 600 weight, 0.1em tracking, uppercase, `--text-muted`
- `.stat-number` — 1.875rem, 800 weight, −0.03em tracking, `--text-primary`

### Charts
Using **Recharts** throughout:
- Installs over time → AreaChart with gradient fill
- Platform breakdown → PieChart (donut) with inline legend
- Creator CPI top 10 → Horizontal BarChart (green = below avg, indigo = above avg)

---

## Calculations Reference

### CPI (Cost Per Install)
`CPI = netCost / installs` — good if ≤ ₹300, okay ≤ ₹500, expensive above

### CPV (Cost Per View)
`CPV = netCost / views`

### Click-to-Install Rate
`C→I% = (installs / clicks) × 100`

### ROAS
`ROAS = revenue / netCost` — proxy only, actual conversion value TBD

### Total budget across all campaigns (as of 2026-06-22)
`₹54,91,601 + ₹5,22,000 + ₹11,82,000 = ₹71,95,601`

---

## Environment Variables

| Var | Where | Purpose |
|---|---|---|
| `DUB_API_KEY` | `.env.local` + Vercel | Dub analytics (server-side only) |
| `SKIP_AUTH_IN_DEV` | `.env.local` ONLY | Skip password check in development |
| `NEXTAUTH_URL` | `.env.local` | NextAuth base URL |
| `NEXTAUTH_SECRET` | `.env.local` + Vercel | NextAuth secret (never log this) |
| `GOOGLE_CLIENT_ID` | Vercel only (when ready) | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Vercel only (when ready) | Google OAuth |
| `ALLOWED_EMAIL_DOMAIN` | Vercel | Restrict to wispr.ai |

---

## Pending / Next Steps

- [ ] Add remaining sheet URLs to `/dashboard/sheets` (user to provide)
- [ ] Replace mock data with live Google Sheets fetch once all URLs are in
- [ ] Implement Google OAuth via NextAuth (restrict to @wispr.ai)
- [ ] Update `TODAY` constant in videos/page.tsx dynamically (or use `new Date()`)
- [ ] July 2026 creator list — user to share, add to `camp-july`
- [ ] Agency one-sheet report template (multi-agency view)
