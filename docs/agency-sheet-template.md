# Agency Sheet Template

Every agency reports through a single Google Sheet with **exactly 5 tabs**, in this order.
The dashboard's sheet sync validates the header row of each tab, so column names and order
must not change.

## General rules

- **No merged cells** anywhere. They break CSV export.
- **Do not rename or reorder header columns.** Add new columns only at the far right.
- **Do not reorder tabs.**
- **One row per deliverable.** Never combine two videos into one row.
- **Confirmed zeros are `0`. Unknown values are left blank.** Never type 0 for a value you
  don't actually know — blank means "unknown", 0 means "measured zero".
- Share as **"Anyone with the link can view"** so CSV export works.
- Dates in `YYYY-MM-DD`. Currency amounts as plain numbers (no ₹ / $ symbols, no commas).

## Tab 1 — Deliverables

| Column        | Example                              | Notes                                  |
| ------------- | ------------------------------------ | -------------------------------------- |
| video_id      | v87                                  | Matches dashboard videoId if known     |
| creator_name  | Ishan Sharma                         |                                        |
| platform      | YouTube                              | YouTube / Instagram / LinkedIn         |
| go_live_date  | 2026-06-10                           | Planned or actual                      |
| status        | Live                                 | Live / Scheduled                       |
| video_url     | https://youtu.be/StMC4AU7Bds         | Full video URL (not channel)           |
| dub_slug      | ishan-yt-1                           | One unique slug per video              |

## Tab 2 — Insights

| Column        | Example   | Notes                                       |
| ------------- | --------- | ------------------------------------------- |
| video_id      | v87       |                                             |
| captured_date | 2026-06-20|                                             |
| views         | 99325     | Blank if unknown                            |
| impressions   | 248000    | Reported impressions (blank if unavailable) |
| reach         | 91000     |                                             |
| likes         | 5400      |                                             |
| comments      | 320       |                                             |
| shares        | 110       |                                             |
| saves         | 75        | Instagram only                              |

## Tab 3 — Costs

| Column          | Example | Notes                                       |
| --------------- | ------- | ------------------------------------------- |
| video_id        | v87     |                                             |
| gross_cost      | 546000  | In the currency column below                |
| currency        | INR     | INR / USD                                   |
| fx_rate         | 84      | Required if currency is USD                 |
| agency_fee      | 54600   |                                             |
| net_cost        | 491400  |                                             |
| cost_confidence | actual  | actual / allocated / estimated / pending    |
| payment_status  | paid    | paid / pending / partial / disputed         |

## Tab 4 — Issues

| Column      | Example                                   | Notes                          |
| ----------- | ----------------------------------------- | ------------------------------ |
| video_id    | v53                                       | Or campaign id                 |
| severity    | warning                                   | critical / warning / info      |
| description | IG insights not shared yet                |                                |
| owner       | Social Tag                                | Who needs to act               |
| status      | open                                      | open / in_progress / resolved  |

## Tab 5 — Instructions

Free-form notes for the agency: links to briefs, contacts, deadlines, escalation paths.
This tab is not parsed by the sync; it exists so everything lives in one document.
