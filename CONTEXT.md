# Wispr Flow India — Creator Marketing Dashboard: Full Context

> Last updated: 2026-06-27 (bug fixes). Give this file to any AI agent to get complete context on the dashboard.

---

## SECURITY NOTE

- All previously documented passwords must be rotated manually before relying on this document.
- Never commit credentials, API keys, or session secrets to this repository.
- `DUB_API_KEY` is server-side only — never expose to browser or client components.
- `NEXTAUTH_SECRET` must never appear in logs, docs, or environment variable dumps.
- `SKIP_AUTH_IN_DEV=true` must only exist in `.env.local`. Setting it on Vercel/production is a security vulnerability — auth bypass is blocked when `VERCEL=1` or `NODE_ENV=production`.
- `/api/dub` and `/api/sheets` endpoints have server-side allowlists — unknown actions/sheet IDs are rejected with 400/403.

---

## 1. What This Is

A Next.js creator marketing dashboard for **Wispr Flow India** — an internal tool that tracks influencer/creator campaigns, video performance, install attribution, and cost efficiency across Instagram, YouTube, and LinkedIn.

**Production URL:** https://creator-dashboard-steel.vercel.app  
**Login:** Production credentials are managed outside the repository. Ask the dashboard owner for access.  
**Local dev:** `npm run dev` in `/Users/shivambhotika/Developer/creator-dashboard`

---

## 2. Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CSS variables for theming |
| Deploy | Vercel (prod) |
| Install attribution | Dub.co API (`ref.wisprflow.ai` domain) |
| Auth | Custom cookie-based auth (`SKIP_AUTH_IN_DEV=true` in `.env.local` only) |

**Key env vars (Vercel):**
- `DUB_API_KEY` — server-side only, never exposed to browser
- `NEXTAUTH_SECRET` — never printed to logs
- `SKIP_AUTH_IN_DEV` — only in `.env.local`, NEVER on Vercel

---

## 3. Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx               ← Overview (server, fetches Dub)
│   │   ├── videos/
│   │   │   ├── page.tsx           ← Server wrapper (fetches Dub)
│   │   │   └── VideosClient.tsx   ← Client table with live Dub data
│   │   ├── performance/
│   │   │   └── page.tsx           ← Server wrapper (fetches Dub) → PerformanceClient
│   │   ├── creators/
│   │   │   └── page.tsx           ← Server wrapper (fetches Dub) → CreatorsClient
│   │   ├── costs/page.tsx         ← CostsClient (no Dub needed)
│   │   ├── agency/page.tsx        ← Agency view
│   │   ├── calendar/page.tsx      ← Go-live calendar
│   │   ├── sheets/page.tsx        ← Links to Google Sheets
│   │   ├── data-health/page.tsx   ← Data quality scores + issue tracker (NEW)
│   │   └── decision/page.tsx      ← Creator renewal matrix + recommended actions (NEW)
│   └── api/
│       ├── auth/login/route.ts    ← Cookie auth endpoint
│       ├── dub/route.ts           ← Dub API proxy (allowlisted actions only)
│       └── sheets/route.ts        ← Google Sheets CSV fetcher (allowlisted sheet IDs only)
├── lib/
│   ├── mock-data.ts               ← ALL campaign, creator, video, perf, cost data
│   ├── dub-server.ts              ← getDubStats() — server-only Dub fetcher
│   ├── attribution.ts             ← Attribution groups for shared-slug creators (NEW)
│   ├── metrics.ts                 ← Canonical KPI calculators and formatters (NEW)
│   └── data-quality.ts            ← Known issues registry + data quality score (NEW)
├── components/
│   ├── OverviewClient.tsx         ← Dashboard home charts + KPI cards
│   ├── PerformanceClient.tsx      ← Performance table + charts
│   ├── CreatorsClient.tsx         ← Creator leaderboard
│   ├── CostsClient.tsx            ← Cost breakdown
│   ├── SortableTable.tsx          ← Reusable sortable table component
│   ├── StatCard.tsx               ← KPI stat card
│   └── MetricBadges.tsx           ← Source/confidence/attribution/issue badge chips (NEW)
├── types/index.ts                 ← TypeScript types for all entities
└── middleware.ts                  ← Route protection (production auth bypass blocked)
scripts/
└── audit-data.mjs                 ← Budget + data integrity audit (NEW)
```

**Pattern for pages with live data:**
Server page calls `getDubStats()` → passes `dubByVideo: Record<string, {clicks, leads}>` as prop to `"use client"` component. Client uses resolved metrics from `src/lib/metrics.ts` with null-aware fallback (unknown = null, not 0).

---

## 4. Data Architecture

### 4.1 Primary data file: `src/lib/mock-data.ts`
All data lives here as typed TypeScript arrays exported as:
- `creators: Creator[]`
- `campaigns: Campaign[]`
- `videos: Video[]` — includes optional `missingInsightReason`, `confirmedDeleted` fields
- `performances: VideoPerformance[]` — includes `reportedImpressions`, `impressionSource` for YT Studio videos
- `costs: Cost[]` — includes `costConfidence`, `allocationMethod` for WLDD allocated costs
- `installs: InstallRecord[]`
- `getAllCreatorMetrics(dubByVideo)` — computed function

### 4.2 Live data: Dub API
`getDubStats()` in `dub-server.ts`:
- Fetches `https://api.dub.co/analytics?domain=ref.wisprflow.ai&key={slug}&event=composite&interval=all&timezone=Asia%2FKolkata`
- Returns `DubSummary { byVideo, totalClicks, totalLeads, interval, timezone, warnings[], partial, fetchedAt }`
- 5-minute ISR cache via `next: { revalidate: 300 }`
- `DUB_SLUGS` maps `videoId → slug | slug[]` (multiple slugs are summed)
- Failed slug fetches are collected into `warnings[]` — dashboard stays up with partial data
- If `DUB_API_KEY` is missing, returns empty byVideo with a warning

### 4.3 Metric resolution (canonical, from `src/lib/metrics.ts`)
Unknown values are `null`, not `0`. Confirmed zero is `0`. Never conflate the two.

```
resolveVideoViews(video, perf)      → confirmedDeleted → 0; missingInsightReason → null; else perf.views
resolveVideoClicks(video, perf, dub) → dub entry exists → dub.clicks; else perf.clickThroughs; else null
resolveVideoInstalls(video, inst, dub) → dub entry exists → dub.leads; else manual rec; else null
resolveVideoSpend(video, costs)     → cost record exists → netCost; else null
resolveVideoImpressions(video, perf) → reportedImpressions (YT Studio) → perf.impressions → estimated (÷0.04) → null
```

### 4.4 Attribution model (`src/lib/attribution.ts`)
Three known shared-attribution groups — video-level CPI is unavailable for these:

| Group | Videos | Creator | Slugs | Attribution |
|---|---|---|---|---|
| ag-ishan | v87, v88, v94 | c87 Ishan Sharma | ishan-sharma-yt, IshanYT, IshanS | Creator-level only |
| ag-nandini | v7, v92 | c7 CA Nandini | NandiniA, Nandini | Creator-level only |
| ag-anurag | v79, v89, v90, v93 | c79 Anurag Bansal | Anurag | Creator-level only (cross-platform mismatch) |

Key helpers: `canShowVideoLevelCPI(videoId)`, `getAttributionWarning(videoId)`, `getAttributionConfidence(videoId)`.

---

## 5. Campaigns

| ID | Name | Budget (₹) | Period | Status | Platform |
|---|---|---|---|---|---|
| `camp-india` | Wispr India Launch | 80,98,321 | Feb–Jun 2026 | Ended | Multi |
| `camp-mtw` | Mumbai Tech Week | 5,22,000 | May 16–21 2026 | Ended | LinkedIn |
| `camp-june` | June 2026 | 70,67,000 | Jun 2026 → | Active | Multi |
| `camp-july` | July 2026 | 0 (TBD) | Jul 2026 → | Planned | Multi |

**Total committed/tracked budget: ₹1,56,87,321.** All campaign budgets exactly equal sum of cost records (verified by `npm run audit:data`).

---

## 6. Campaigns — Detailed Breakdown

### camp-india (₹80,98,321)
Sub-cohorts:
- **Finnet** (c1–c6): Instagram — Anushka Rathod, Nidhi Kunwar, Ayush Shukla, Ananya Bagri, Jayant, Shankar Bhalla
- **Creator Dream** (c7): YouTube — CA Nandini (separate agency from Finnet; managed camp-india YT deal)
- **AEOS** (c8–c10): Instagram — Aevy TV, Arjun Vaidya, Maitri Mangal
- **Owled** (c11–c20): Instagram — gommaboy, Kartik Sadvij, Raj Patel, Nitin Sequeira, Kiran Kumar, Varun Agarwal, Vishal Dayama, Jay Kapoor, Pritika Loonia, Shivanshu Agrawal
- **LinkedIn Seeding** (c21–c31): Organic ₹0 cost — Anubhav Dubey, Shivani Gera, Anant Sekhsaria, Parth Sanghvi, CA Rahul Arora, Harinder Singh Pelia, Adityan Kayalakal, Jeet Chandan, Prateek Malpani, Saransh Anand, Rohit Singh
- **Batch 1 / Palak / Direct** (c77–c86): Instagram + LinkedIn — Aarti Samant, Gayatri Agrawal, Anurag Bansal (IG reels), Ayush Wadhwa, Jivraj Sachar, Miti Shah, Ansh Mehra, Paras Madan, Anik Jain, Aditya Agrawal

### camp-mtw (₹5,22,000)
18 LinkedIn creators at Mumbai Tech Week (c32–c49). All posted LinkedIn content from the event. Total confirmed signups: 200 (tracked via manual short links wisprflow.ai/r/*).

### camp-june (₹70,67,000)
Three sub-cohorts:
- **WLDD** (c50–c66): Instagram + YouTube creators. WLDD is a separate agency — no relation to Social Tag. Total allotted ₹35,00,000. Per-creator cost confirmed from WLDD master sheet (2026-06-27). `costConfidence: "actual"` in cost records. Total ₹30.6L.
- **Coding First / Discovr** (c67–c76): YouTube dev/coding creators managed by agency **Discovr**. Total ₹11,82,000.
- **Direct** (c7, c79, c87, c88): CA Nandini v92, Anurag Bansal YT, Ishan Sharma, Vaibhav Sisinity. Directly contracted.

---

## 7. Creator Roster (by ID)

### camp-india
| ID | Name | Platform | Tier | Agency |
|---|---|---|---|---|
| c1 | Anushka Rathod | Instagram | Macro | Finnet |
| c2 | Nidhi Kunwar | Instagram | Macro | Finnet |
| c3 | Ayush Shukla | Instagram | Mid | Finnet |
| c4 | Ananya Bagri | Instagram | Nano | Finnet |
| c5 | Jayant (Markets with Jayant) | Instagram | Mid | Finnet |
| c6 | Shankar Bhalla | Instagram | Macro | Finnet |
| c7 | CA Nandini | YouTube | Mid | Creator Dream |
| c8 | Aevy TV | Instagram | Mid | AEOS |
| c9 | Arjun Vaidya | Instagram | Mid | AEOS |
| c10 | Maitri Mangal | Instagram | Mid | AEOS |
| c11 | gommaboy | Instagram | Macro | Owled |
| c12–c20 | Owled IG creators | Instagram | Nano–Mega | Owled |
| c21–c31 | LinkedIn Seeding creators | LinkedIn | Various | Social Tag (organic) |
| c77 | Aarti Samant | Instagram | Macro | Palak |
| c78 | Gayatri Agrawal | Instagram | Mid | Direct |
| c79 | Anurag Bansal | YouTube | Mid | Direct |
| c80 | Ayush Wadhwa | Instagram | Mid | Direct |
| c81 | Jivraj Sachar | LinkedIn | Micro | Palak |
| c82 | Miti Shah | LinkedIn | Micro | Palak |
| c83 | Ansh Mehra | Instagram | Mid | Social Tag |
| c84 | Paras Madan | Instagram | Mid | Palak |
| c85 | Anik Jain | Instagram | Macro | Social Tag |
| c86 | Aditya Agrawal | LinkedIn | Micro | Palak |

### camp-mtw (c32–c49)
18 LinkedIn creators: Jhalak, Rishika Maheshwari, Sagar Kumar, Suryakant Chaurasiya, Bhavya Taneja, Jayesh Marathe, Riyasha Jaiswal, Riya Thukral, Supriya Purohit, Raunak Yadush, Vikram Kushwaha, Yogesh Lakhpatani, Pratyaksh Sharma, Sonali Malhotra, Kriti Khanna, Vijay Chollangi, Avani Rathore, Aashish Jhunjhunwala.

### camp-june
| ID | Name | Platform | Tier | Followers | avgViews | Agency |
|---|---|---|---|---|---|---|
| c50 | infoby_shree | Instagram | Micro | — | 15,039 | Social Tag |
| c51 | insta__nirav | Instagram | Micro | — | 4,139 | Social Tag |
| c52 | kochu.ai | Instagram | Micro | — | 20,168 | Social Tag |
| c53 | financewithjobi | Instagram | Micro | — | — (not shared) | Social Tag |
| c54 | prettymuchbusiness | Instagram | Mid | — | — (not shared) | Social Tag |
| c55 | Apple Wale Bhaiya | YouTube | Micro | 38K | 11,354 | Social Tag |
| c56 | ezsnippet | YouTube | Macro | 810K | 157,488 | Social Tag |
| c57 | Vaibhav Kadnar | YouTube | Macro | 7.1M | 153,343 | Social Tag |
| c58 | bisboworld | YouTube | Macro | 871K | 50,170 | Social Tag |
| c59 | Akber Shaikh | YouTube | Micro | 96.6K | 23,829 | Social Tag |
| c60 | WhyBhanshu | YouTube | Macro | 101K | 6,557 | Social Tag |
| c61 | Mohammed Fraz | YouTube | Macro | 563K | 28,411 | Social Tag |
| c62–c66 | Think Wings, Full Disclosure, Technical Suneja, Dhaval Kataria, Tharun Speaks | YouTube | Mid–Macro | — | — | Social Tag |
| c67 | Coding with Sagar | YouTube | Macro | 485K | 29,228 | Direct |
| c68 | Nishant Chahar | YouTube | Macro | 579K | 14,912 | Direct |
| c69 | Saumya Singh | YouTube | Mid | 195K | 5,499 | Direct |
| c70 | Pavan Lalwani | YouTube | Mid | 320K | 22,029 | Direct |
| c71 | Mehul Mohan | YouTube | Macro | 469K | 16,219 | Direct |
| c72 | Sheryians Coding | YouTube | Macro | 703K | 25,000 ⚠ unverified | Direct |
| c73 | Engineering Digest | YouTube | Mid | 248K | 2,184 | Direct |
| c74 | Arsh Goyal | YouTube | Mid | 280K | — | Direct |
| c75 | Code And Bug | YouTube | Nano | 31.6K | 12,000 ⚠ unverified | Direct |
| c76 | Astro | YouTube | Micro | 79K | 2,879 | Direct |
| c87 | Ishan Sharma | YouTube | Macro | 2.15M | 99,325 | Direct |
| c88 | Vaibhav Sisinity | YouTube | Macro | 726K | 139,865 | Direct |

---

## 8. Video Roster — All Videos

### camp-india Videos
| ID | Creator | Platform | Go-Live | Views | Notes |
|---|---|---|---|---|---|
| v1–v6 | Finnet IG creators | Instagram | Mar 2026 | from agency | Live |
| v7 | CA Nandini | YouTube | Mar 25 | 71,075 | Shared attribution with v92 |
| v8–v9 | AEOS IG creators | Instagram | Mar 2026 | from agency | Live |
| v10 | Maitri Mangal | Instagram | Mar 18 | null | Insights in MP4 only — not extracted |
| v11 | gommaboy | Instagram | May 07 | 0 | Confirmed deleted (account deactivated) |
| v12–v20 | Owled IG creators | Instagram | May 2026 | real Owled data | Live |
| v21–v31 | LinkedIn Seeding | LinkedIn | Apr 2026 | real LinkedIn data | Live |
| v77 | Aarti Samant | Instagram | Mar 19 | null | Creator has not shared insights |
| v78 | Gayatri Agrawal | Instagram | Mar 20 | null | Creator has not shared insights |
| v79 | Anurag Bansal | Instagram | Mar 18 | 2,10,000 | IG Reel 1; shared attribution group |
| v93 | Anurag Bansal | Instagram | May 01 | 1,01,000 | IG Reel 2; shared attribution group |
| v80 | Ayush Wadhwa | Instagram | Mar 25 | null | Creator has not shared insights |
| v81–v82 | Jivraj Sachar, Miti Shah | LinkedIn | Mar 2026 | 0 | Live |
| v83 | Ansh Mehra | Instagram | Mar 20 | null | Creator has not shared insights |
| v84 | Paras Madan | Instagram | Mar 19 | null | Creator has not shared insights |
| v85 | Anik Jain | Instagram | Mar 20 | null | Creator has not shared insights |
| v86 | Aditya Agrawal | LinkedIn | Mar 20 | 0 | Live |

### camp-mtw Videos (v32–v49)
All LinkedIn posts from Mumbai Tech Week, May 16–21 2026. Views/impressions from LinkedIn analytics.

### camp-june Videos — WLDD
| ID | Creator | Platform | Go-Live | Views | Status |
|---|---|---|---|---|---|
| v50 | infoby_shree | Instagram | Jun 07 | 15,039 | Live |
| v51 | insta__nirav | Instagram | Jun 09 | 4,139 | Live |
| v52 | kochu.ai | Instagram | Jun 09 | 20,168 | Live |
| v53 | financewithjobi | Instagram | Jun 15 | null | Insights not shared by Social Tag |
| v54 | prettymuchbusiness | Instagram | Jun 15 | null | Insights not shared by Social Tag |
| v55 | Apple Wale Bhaiya | YouTube | Jun 10 | 11,354 | Live |
| v56 | ezsnippet | YouTube | Jun 10 | 157,488 | Live |
| v57 | Vaibhav Kadnar | YouTube | Jun 13 | 153,343 | Live |
| v58 | bisboworld | YouTube | Jun 13 | 50,170 | Live |
| v59 | Akber Shaikh | YouTube | Jun 19 | 23,829 | Live |
| v60 | WhyBhanshu | YouTube | Jun 20 | 6,557 | Live |
| v61 | Mohammed Fraz | YouTube | Jun 21 | 28,411 | Live |
| v62–v66 | Think Wings, Full Disclosure, Technical Suneja, Dhaval Kataria, Tharun Speaks | YouTube | Jun 27–Jul 10 | 0 | Scheduled |

### camp-june Videos — Coding First
| ID | Creator | Platform | Title | Go-Live | Views | Status |
|---|---|---|---|---|---|---|
| v67 | Coding with Sagar | YouTube | FastAPI for Machine Learning - Full Course | Jun 05 | 29,228 | Live |
| v68 | Nishant Chahar | YouTube | SKILLS That Will Get You High-Paying Jobs in 2026 | Jun 08 | 14,912 | Live |
| v69 | Saumya Singh | YouTube | I Reviewed 1000+ Resumes. These Projects Get You Hired | Jun 03 | 5,499 | Live |
| v70 | Pavan Lalwani | YouTube | I Used Power BI MCP and It Replaced Hours of Manual Work | Jun 17 | 22,029 | Live |
| v71 | Mehul Mohan | YouTube | You Can Finally Stop Using Bun | Jun 12 | 16,219 | Live |
| v72 | Sheryians Coding | YouTube | ⚠ channel URL only — no confirmed video URL | Jun 01 | 25,000 ⚠ unverified | Live |
| v73 | Engineering Digest | YouTube | These 5 AI Tools Make Developers More Valuable Than Ever | Jun 24 | 2,184 | Live |
| v74 | Arsh Goyal | YouTube | ⚠ channel URL only | Jun 23 | — | Scheduled |
| v75 | Code And Bug | YouTube | ⚠ channel URL only — no confirmed video URL | Jun 20 | 12,000 ⚠ unverified | Live |
| v76 | Astro | YouTube | This FREE AI Coding Tool From Google Is Seriously Underrated! | Jun 10 | 2,879 | Live |

### camp-june Videos — Direct
| ID | Creator | Platform | Title | Go-Live | Views | Impressions (source) | Cost |
|---|---|---|---|---|---|---|---|
| v87 | Ishan Sharma | YouTube | 10 Claude Skills I Can't Live Without | Jun 01 | 150,832 | 2,200,000 (YT Studio) | ₹2,73,000 |
| v88 | Ishan Sharma | YouTube | I stopped typing after using this AI tool! | **Apr 25** | 18,743 | 302,900 (YT Studio) | ₹2,73,000 |
| v94 | Ishan Sharma | YouTube | Full Claude Tutorial For Beginners | Jun 05 | 128,400 | 2,100,000 (YT Studio) | ₹2,73,000 |
| v91 | Vaibhav Sisinity | YouTube | Claude Fable 5 Is Mythos | Jun 01 | 139,918 | 1,700,000 (YT Studio) | ₹8,40,000 |
| v89 | Anurag Bansal | YouTube | IPL's Crazy Money-Making Model Explained | Jun 01 | 65,154 | 1,629,000 (est.) | ₹3,00,000 |
| v90 | Anurag Bansal | YouTube | Amazon's Big Problem With 10-Minute Delivery | Jun 10 | 25,389 | 634,700 (est.) | ₹3,00,000 |
| v92 | CA Nandini | YouTube | This AI Tool is Better Than Claude? | Jun 01 | 19,322 | 483,000 (est.) | ₹1,26,000 |

> **v88 went live Apr 25** — excluded from June YouTube totals by default. It is part of the Ishan 3-video package (₹8,19,000 total).

---

## 9. Dub Ref Link Slugs

`DUB_SLUGS` in `src/lib/dub-server.ts` maps `videoId → slug(s)`. Multiple slugs are fetched in parallel and summed. All fetches use `interval=all&timezone=Asia%2FKolkata`.

```
// Finnet / AEOS (camp-india IG creators — slugs confirmed from Mastered Data 2026-06-27)
v1→AnushkaR, v2→NidhiK, v3→AyushS, v4→AnanyaB, v5→JayantM,
v6→ShankarB, v8→AevyTV, v9→ArjunV, v10→MaitriM

// WLDD (camp-june)
v50→infobyshree, v51→insta-nirav, v52→kochu-ai, v53→financewithjobi,
v54→prettymuchbusiness, v55→applewale-bhaiya, v56→ezsnippet,
v57→vaibhavkadnar, v58→bisboworld, v59→akbershaikh, v60→WhyBhanshu
v61→fraz, v62→thinkwings, v64→technicalsuneja
// v63 Full Disclosure: slug CONFLICT — uses "financewithjobi" same as v53. No Dub tracking until fixed.

// Coding First
v67→codingwithsagar, v68→nishantchahar, v69→saumyasingh,
v70→pavanlalwani, v71→mehulmpt, v73→engineeringdigest,
v74→arshgoyal, v75→codeandbug, v76→astrokj

// MTW
v35→suryakant-chaurasiya

// Multi-slug (summed across all ref links)
v7→[NandiniA, Nandini]                        ← all CA Nandini traffic under v7
v87→[ishan-sharma-yt, IshanYT, IshanS]        ← all Ishan traffic under v87

// Direct / Batch 1
v91→vaibhavyt, v79→Anurag
v77→AartiS, v78→Gayatri, v80→Ayush, v81→Jivraj, v82→MitiS,
v83→AnshM, v84→ParasM, v85→AnikJ, v86→AdityaA
```

**Attribution notes:**
- Ishan (v87/v88/v94): all traffic under v87 slugs. `canShowVideoLevelCPI("v88") === false`.
- CA Nandini (v7/v92): all traffic under v7 slugs. `canShowVideoLevelCPI("v92") === false`.
- Anurag (v79/v89/v90/v93): all traffic under v79 slug. Cross-platform (IG slug used for YT videos).
- v88/v94 have no Dub entry in `byVideo` — `resolveVideoInstalls` returns `null` for them, not 0.

---

## 10. Cost Records & Rates

### Currency convention
All costs stored in **INR**. USD conversion: **1 USD = ₹84**.

### Cost rates by creator
| Creator | Rate | Total paid | Cost confidence |
|---|---|---|---|
| CA Nandini | $1,500/YT = ₹1,26,000 | v7+v92: ₹2,52,000 | actual |
| Ishan Sharma | $3,250/YT = ₹2,73,000 | v87+v88+v94: ₹8,19,000 | actual |
| Vaibhav Sisinity | $10,000/YT = ₹8,40,000 | v91: ₹8,40,000 | actual |
| Anurag Bansal | ₹3,00,000/YT video | v89+v90: ₹6,00,000 | actual |
| Anurag Bansal | v79: ₹2,50,000, v93: ₹1,00,000 | IG reels | actual |
| WLDD creators (c50–c66) | Estimated allocation | ₹35,00,000 total | **allocated** |

### WLDD ₹35L allocation methodology
No per-creator breakdown from agency. Estimated by tier × platform weight:
- Tier units: Micro=2, Mid=3, Macro=6, Mega=10
- YouTube = 2× Instagram rate
- Total: exactly ₹35,00,000
- Cost records have `costConfidence: "allocated"`, `allocationMethod: "tier_platform_weight"`

---

## 11. Performance & Impressions — Methodology

### YouTube impressions
- **Real YT Studio data** (`impressionSource: "platform"`): v87 (2.2M), v88 (302.9K), v91 (1.7M), v94 (2.1M)
- **Estimated at 4% CTR** (`impressionSource: "estimated"`): all other YT videos — `views / 0.04`
  - Scenario bands: low = views/0.025, base = views/0.04, high = views/0.06
  - Real CTRs observed: Nandini 3.71%, Vaibhav Sisinity 5.9%, Ishan 4.5–5%

### Instagram
- Actual view counts from creator/agency insight screenshots. Not extrapolated.
- Platform views ≠ impressions — don't label as impressions.

### CPM labelling rules
- `trueCPM` — only when `reportedImpressions` (YT Studio) exists: `spend / reportedImpressions * 1000`
- `estimatedCPM` — when using extrapolated impressions. Always labelled "Estimated CPM".
- **ROAS: not calculated** — no revenue or LTV data connected. Dashboard shows "ROAS unavailable".

### Data freshness
- YouTube view counts: scraped live 2026-06-25 via Python urllib
- Instagram: manually provided by creators/agencies
- LinkedIn: from creator-shared LinkedIn analytics

---

## 12. New Libraries Added (2026-06-26)

### `src/lib/metrics.ts`
Canonical metric resolution and KPI calculators. Import from here, never inline formulas in pages.

Key exports:
- `safeDivide(n, d)` — returns null on null/zero denominator, never throws
- `sumNonNull(values)` — sums only non-null values
- `resolveVideoViews/Impressions/Clicks/Installs/Spend(video, ...)` → `ResolvedMetric`
- `calculateCPV/CPC/CPI/TrueCPM/EstimatedCPM/CTR(spend, metric)` → `number | null`
- `formatCurrencyINR/USD`, `formatPercent`, `formatNullableNumber`, `formatMetricValue`

### `src/lib/attribution.ts`
Attribution group definitions and helpers.

Key exports:
- `ATTRIBUTION_GROUPS: AttributionGroup[]`
- `canShowVideoLevelCPI(videoId): boolean`
- `getAttributionWarning(videoId): string | undefined`
- `getAttributionConfidence(videoId): MetricConfidence`
- `getAttributionGroupForVideo(videoId): AttributionGroup | undefined`

### `src/lib/data-quality.ts`
23-item known issues registry and data quality score calculator.

Key exports:
- `KNOWN_ISSUES: DataIssue[]`
- `getAllDataIssues()`, `getDataIssuesForVideo(videoId)`, `getOpenIssueCount(severity?)`
- `calculateDataQualityScore()` → `{ overall, metricCompleteness, attributionConfidence, costConfidence, freshness, sourceReliability }`

### `src/components/MetricBadges.tsx`
Badge chips for source/confidence/attribution/issue provenance. Import into any table or card.

Key exports: `MetricProvenanceChip`, `ConfidenceBadge`, `AttributionBadge`, `DataIssueBadge`, `EmptyMetric`

---

## 13. New Types Added to `src/types/index.ts`

```ts
// New type aliases
AttributionLevel, AttributionAllocationMethod, MetricConfidence, MetricSource
CostConfidence, CostAllocationMethod, DataIssueSeverity, DataIssueType

// New interfaces
AttributionGroup, DataIssue, ResolvedMetric<T>

// Extensions to existing interfaces (all optional, backward-compatible)
Cost: +costConfidence, +allocationMethod, +paymentStatus, +invoiceStatus, +grossAmount, etc.
Video: +missingInsightReason, +confirmedDeleted, +topic, +hookType, +ctaType, etc.
VideoPerformance: +reportedImpressions, +estimatedImpressions, +viewSource, +impressionSource
```

---

## 14. New Pages

### `/dashboard/data-health`
Data quality scores (0–100 across 5 dimensions) + full issue tracker with 23 known issues grouped by severity. Includes calculation notes explaining every methodology. No Dub data required — static render.

### `/dashboard/decision`
Creator renewal matrix sorted by CPI (lower = better). Shows: views, installs, spend, CPI (USD), CPV (₹), attribution level, renewal recommendation (Renew Strongly → Renegotiate → Do Not Renew → Fix Attribution First → Insufficient Data). ROAS clearly shown as unavailable. Includes 7-item recommended actions list.

---

## 15. June 2026 YouTube Performance Summary

As of 2026-06-25:

| Metric | Value |
|---|---|
| Total June YT views | **1,090,117** (~10.9 lakh) |
| Videos live | 22 |
| Unique creators live | 20 |
| Videos with unverified URLs/views | v72 (Sheryians 25K), v74 (Arsh Goyal), v75 (Code And Bug 12K) |

Top 5 by views: ezsnippet (157K), Vaibhav Kadnar (153K), Ishan v87 (151K), Vaibhav Sisinity (140K), Ishan v94 (128K)

> v88 (Apr 25 go-live) excluded from June totals. v72/v74/v75 have channel URLs only — view counts may be Google Sheet estimates.

---

## 16. Known Data Gaps / Pending Items

| Item | Why missing | Owner | How to fix |
|---|---|---|---|
| v72, v74, v75 — no confirmed video URL | URL not shared / not yet live | Direct | Share video URL |
| v62–v66 — scheduled future videos | Not yet live | Social Tag | Auto-updates when live |
| v53, v54 — IG insights missing | Agency hasn't shared | Social Tag | Request insights |
| v77, v78, v80, v83, v84, v85 — IG insights missing | Creators haven't shared | Direct/Social Tag | Request insights |
| v10 — Maitri Mangal insights in MP4 | Not extracted | AEOS | Extract from MP4 |
| v11 — gommaboy deleted | Page deleted | — | Resolved as confirmed 0 |
| Full Disclosure Dub slug | Using wrong slug (conflicts with v53) | WLDD | Ask WLDD to create unique ref.wisprflow.ai/fulldisclosure link |
| Anurag v89/v90 — no YouTube slugs | IG slug used for YT videos | Shivam | Create separate YT slugs |
| Ishan/Nandini shared slugs | Same links across 3/2 videos | Shivam | Create per-video slugs in next deal |
| camp-july creator list | Not yet received | Shivam | Pending |

---

## 17. UI Pages

| Route | Purpose | Dub data? |
|---|---|---|
| `/dashboard` | Overview — KPI cards, monthly trend charts, platform breakdown, top creators | Yes (server) |
| `/dashboard/videos` | Full video table — views, clicks, installs, CPI, attribution badges | Yes (server wrapper + client) |
| `/dashboard/performance` | Performance charts — impressions, CTR, install funnel | Yes (server wrapper + client) |
| `/dashboard/creators` | Creator leaderboard — installs, CPI, efficiency score | Yes (server wrapper + client) |
| `/dashboard/costs` | Cost breakdown by campaign/creator — CPV, CPI | No (static) |
| `/dashboard/agency` | Agency accountability view | No |
| `/dashboard/calendar` | Go-live calendar | No |
| `/dashboard/sheets` | Links to Google Sheets | No |
| `/dashboard/data-health` | Data quality scores + 23-item issue tracker | No |
| `/dashboard/decision` | Creator renewal matrix + recommended actions | Yes (server, fetches Dub) |

---

## 18. Google Sheets Connected

Allowlisted in `/api/sheets/route.ts`. Only these IDs are permitted:

| Sheet ID | Contents |
|---|---|
| `1f0dAHqqkIv3MiRyKUxrJ7UsXDNOwWyQ7wp8M9_M0hG0` | Finnet Campaign Master Tracker (c1–c7) |
| `1-il4V8YW8Fob3NMogIm1db7PvBR4PsfAKGXoShWe5N8` | Wispr × WLDD June 2026 (c50–c66) |

Sheet URL format: `https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}`

---

## 19. Security Constraints

- `SKIP_AUTH_IN_DEV=true` — `.env.local` ONLY. Middleware blocks auth bypass when `VERCEL=1` or `NODE_ENV=production`.
- `DUB_API_KEY` — server-side only (`dub-server.ts`). Never in client components or browser.
- `NEXTAUTH_SECRET` — never printed to logs or transcript.
- Never delete Google Drive files (read-only access only).
- `/api/dub` — actions allowlist: only `links`, `stats`, `installs` accepted.
- `/api/sheets` — sheet ID allowlist: only the 2 known IDs above accepted.
- Auth: cookie-based; `/api/auth/login` sets the cookie; middleware protects `/dashboard/*`.

---

## 20. How to Update Data

1. **Add a new video**: Add to `videos[]` in `mock-data.ts`. Add `performances[]` record. Add `costs[]` record. If there's a unique Dub slug, add to `DUB_SLUGS` in `dub-server.ts`. If it's a shared-attribution video, add to `ATTRIBUTION_GROUPS` in `attribution.ts`.
2. **Update view counts**: Edit `views:` in `performances[]`. For YT Studio impressions, set `reportedImpressions` and `impressionSource: "platform"`. Otherwise leave blank — extrapolation is automatic.
3. **Flag missing insights**: Add `missingInsightReason: "..."` to the `videos[]` record. The view will show `null` + reason instead of 0.
4. **Add confirmed deleted**: Set `confirmedDeleted: true` on the `videos[]` record. Views will show 0 with "Content deleted" note.
5. **Add a new creator**: Add to `creators[]` with unique `id: "cNN"`. Add to campaign `creatorIds[]`.
6. **Update campaign budget**: Must equal exact sum of all `cost.netCost` for that campaign. Verify with `npm run audit:data`.
7. **Deploy**: `npx vercel --prod` from project root. TypeScript checks run automatically.

---

## 21. Audit & Tooling

### `npm run audit:data`
Runs `scripts/audit-data.mjs`. Checks:
1. Campaign budget == sum of cost records (all 4 campaigns)
2. Total tracked budget == ₹1,56,87,321
3. No production password in CONTEXT.md
4. v88 has April 2026 go-live date
5. v72/v74/v75 have `missingInsightReason`
6. WLDD costs have `costConfidence: "allocated"`

### `npm run typecheck` (or `npx tsc --noEmit`)
Full TypeScript check. Must pass before deploy.

### `npm run build`
Full Next.js production build. All 19 pages must build clean.
