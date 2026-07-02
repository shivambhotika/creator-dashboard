# Wispr India Creator Dashboard

Internal creator-ops dashboard for tracking Wispr India's creator marketing campaigns across spend, views, clicks, installs, CPI, CPV, attribution, data quality, and renewal decisions.

For full project memory, architecture, calculations, pending work, and change history, read `context.md`.

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in local credentials and provider keys.
3. Install dependencies with `npm ci`.
4. Start the dashboard with `npm run dev`.

## Useful Checks

```bash
npm run typecheck
npm run lint
npm run build
npm run audit:data
npm run audit:live
```

Never commit real secrets. If a key appears in docs/source, rotate it and replace it with a placeholder.
