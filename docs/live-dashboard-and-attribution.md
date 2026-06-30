# Live Dashboard & Attribution

This document describes how the Wispr Flow India creator dashboard tracks live metrics
and attributes installs to individual videos.

## Per-video unique slug policy

Every video should get its **own** Dub ref link. When a creator publishes multiple videos
under the same slug, video-level attribution becomes impossible — we can only attribute at
the creator level. The dashboard always labels such numbers as **ESTIMATED**, never exact.

### Slug format

```
ref.wisprflow.ai/{creatorSlug}-{platform}-{videoNumber}
```

- `creatorSlug` — short, stable identifier for the creator (e.g. `ishan`)
- `platform` — `yt`, `ig`, or `li`
- `videoNumber` — 1-based per-creator counter

### Examples

| Creator     | Video | Recommended slug        | Current (shared) slugs                 |
| ----------- | ----- | ----------------------- | -------------------------------------- |
| Ishan Sharma | v87   | `ishan-yt-1`            | `ishan-sharma-yt`, `IshanYT`, `IshanS` |
| Ishan Sharma | v88   | `ishan-yt-2`            | (shared — same 3 slugs)                |
| Ishan Sharma | v94   | `ishan-yt-3`            | (shared — same 3 slugs)                |
| CA Nandini  | v7    | `nandini-yt-1`          | `NandiniA`, `Nandini`                  |
| CA Nandini  | v92   | `nandini-yt-2`          | (shared)                               |
| Anurag Bansal | v79 | `anurag-ig-1`           | `Anurag`                               |
| Anurag Bansal | v89 | `anurag-yt-1`           | (shared IG slug — cross-platform)      |
| Anurag Bansal | v90 | `anurag-yt-2`           | (shared)                               |

Because Ishan, Nandini, and Anurag reused slugs across videos, their video-level installs
are inferred (see Attribution certainty levels) rather than measured.

## UTM structure

Append UTM parameters to the destination URL behind every Dub link:

```
utm_source={platform}        # youtube | instagram | linkedin
utm_medium=creator
utm_campaign={campaignId}     # camp-india | camp-mtw | camp-june
utm_content={videoId}         # v87, v88, ...
```

`utm_content` carries the videoId so that, even when a slug is shared, downstream tools
can still distinguish video-level traffic if the link query string is preserved.

## Attribution certainty levels

`AttributionCertainty` (see `src/types/index.ts`):

- **exact** — one unique slug maps to exactly one video. Video-level CPI is billable.
- **estimated** — slug shared across multiple videos. The creator-level total is exact,
  but the per-video split is inferred via time-window + view-velocity scoring.
- **creator_level** — only creator-level totals are meaningful; do not surface per-video numbers.
- **unknown** — no slug / no mapping.

`InferredAttributionConfidence` is the label attached to each inferred per-video split:
`exact`, `high_estimated`, `medium_estimated`, `low_estimated`, `unassigned`.

### How estimated splits are computed

`src/lib/sync/attribution.ts` distributes the creator-level Dub lead total across the
group's videos:

1. Compute a time-decay weight per video from days-since-go-live, using platform-specific
   windows (YouTube 3/14/45, Instagram 2/7/14, LinkedIn 3/7/14 days for strong/normal/long-tail).
2. If no view-velocity snapshot exists: probability ∝ time weight only.
3. If view velocity is available: blend 45% time weight + 35% daily view share +
   15% recent velocity + 5% platform weight.
4. Normalize probabilities to sum to 1, multiply by the creator-level total.

Every output row is stored as an `InferredAttribution` with an `explanation` and a
non-exact confidence label. The UI renders an amber "ESTIMATED — not exact" badge.
