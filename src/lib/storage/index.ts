/**
 * Storage abstraction for sync snapshots + sync history.
 *
 * If DATABASE_URL is set, uses the `postgres` npm package (Postgres).
 * Otherwise, falls back to in-memory Maps and warns once. The fallback
 * never throws, so page renders and sync routes degrade gracefully.
 */

import type {
  ContentMetricSnapshot,
  DubMetricSnapshot,
  DubTimeseriesPoint,
  InferredAttribution,
  SyncRun,
  SyncSource,
} from "@/types";
import type {
  DateRange,
  DubSnapshotInput,
  InferredAttributionInput,
  MetricSnapshotInput,
  SyncRunInput,
} from "@/lib/sync/types";

type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

const DATABASE_URL = process.env.DATABASE_URL;

let warned = false;
function warnOnce(): void {
  if (!warned) {
    warned = true;
    console.warn(
      "[storage] DATABASE_URL not set — using in-memory fallback. Sync history and snapshots will not persist."
    );
  }
}

// ── In-memory stores ──────────────────────────────────────────────
const memMetricSnapshots: ContentMetricSnapshot[] = [];
const memSyncRuns: SyncRun[] = [];
const memDubSnapshots: DubMetricSnapshot[] = [];
const memDubTimeseries: DubTimeseriesPoint[] = [];
const memInferred: InferredAttribution[] = [];

// ── Postgres client (lazy) ────────────────────────────────────────
let sqlClient: Sql | null = null;
let sqlInitFailed = false;
let schemaReady = false;

async function getSql(): Promise<Sql | null> {
  if (!DATABASE_URL) {
    warnOnce();
    return null;
  }
  if (sqlClient) return sqlClient;
  if (sqlInitFailed) return null;
  try {
    // Dynamic import so the bundle/build does not require `postgres` when DB is unused.
    const mod = (await import("postgres")) as unknown as { default: (url: string, opts?: unknown) => Sql };
    const factory = mod.default;
    sqlClient = factory(DATABASE_URL, { idle_timeout: 20, max: 5 });
    await ensureSchema(sqlClient);
    return sqlClient;
  } catch (err) {
    sqlInitFailed = true;
    console.warn(
      `[storage] Failed to connect to Postgres — falling back to in-memory. ${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  }
}

async function ensureSchema(sql: Sql): Promise<void> {
  if (schemaReady) return;
  await sql`CREATE TABLE IF NOT EXISTS sync_runs (
    id TEXT PRIMARY KEY, source TEXT NOT NULL, status TEXT NOT NULL, triggered_by TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL, completed_at TIMESTAMPTZ, rows_read INTEGER, rows_changed INTEGER,
    items_created INTEGER, items_updated INTEGER, warnings JSONB, errors JSONB, metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS content_metric_snapshots (
    id TEXT PRIMARY KEY, video_id TEXT NOT NULL, creator_id TEXT NOT NULL, campaign_id TEXT NOT NULL,
    platform TEXT NOT NULL, captured_at TIMESTAMPTZ NOT NULL, source TEXT NOT NULL, views INTEGER,
    reported_impressions INTEGER, estimated_impressions INTEGER, reach INTEGER, likes INTEGER,
    comments INTEGER, shares INTEGER, saves INTEGER, source_confidence TEXT NOT NULL,
    raw_payload JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS dub_metric_snapshots (
    id TEXT PRIMARY KEY, slug TEXT NOT NULL, video_id TEXT, attribution_group_id TEXT,
    captured_at TIMESTAMPTZ NOT NULL, interval TEXT, start_date TEXT, end_date TEXT,
    timezone TEXT NOT NULL, clicks INTEGER, leads INTEGER, sales INTEGER,
    source TEXT NOT NULL DEFAULT 'dub', source_confidence TEXT NOT NULL, raw_payload JSONB,
    warnings JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS dub_timeseries_points (
    id TEXT PRIMARY KEY, slug TEXT NOT NULL, attribution_group_id TEXT, date TEXT NOT NULL,
    event_type TEXT NOT NULL, count INTEGER NOT NULL, fetched_at TIMESTAMPTZ NOT NULL,
    UNIQUE(slug, date, event_type)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS inferred_attributions (
    id TEXT PRIMARY KEY, attribution_group_id TEXT NOT NULL, creator_id TEXT NOT NULL,
    video_id TEXT NOT NULL, source_event_id TEXT, source_date TEXT, event_type TEXT NOT NULL,
    event_timestamp TIMESTAMPTZ, allocated_value REAL NOT NULL, probability REAL NOT NULL,
    method TEXT NOT NULL, confidence TEXT NOT NULL, explanation TEXT NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  schemaReady = true;
}

// ── Row mappers ───────────────────────────────────────────────────
function asNum(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}
function asStr(v: unknown): string {
  return v == null ? "" : String(v);
}
function asStrOrNull(v: unknown): string | null {
  return v == null ? null : String(v);
}
function asArr(v: unknown): string[] | undefined {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v.map(String);
  return undefined;
}

function mapMetricSnapshot(r: Record<string, unknown>): ContentMetricSnapshot {
  return {
    id: asStr(r.id),
    videoId: asStr(r.video_id),
    creatorId: asStr(r.creator_id),
    campaignId: asStr(r.campaign_id),
    platform: asStr(r.platform) as ContentMetricSnapshot["platform"],
    capturedAt: new Date(asStr(r.captured_at)).toISOString(),
    source: asStr(r.source) as ContentMetricSnapshot["source"],
    views: asNum(r.views),
    reportedImpressions: asNum(r.reported_impressions),
    estimatedImpressions: asNum(r.estimated_impressions),
    reach: asNum(r.reach),
    likes: asNum(r.likes),
    comments: asNum(r.comments),
    shares: asNum(r.shares),
    saves: asNum(r.saves),
    sourceConfidence: asStr(r.source_confidence) as ContentMetricSnapshot["sourceConfidence"],
    rawPayload: r.raw_payload,
    createdAt: new Date(asStr(r.created_at)).toISOString(),
  };
}

function mapSyncRun(r: Record<string, unknown>): SyncRun {
  return {
    id: asStr(r.id),
    source: asStr(r.source) as SyncSource,
    status: asStr(r.status) as SyncRun["status"],
    triggeredBy: asStr(r.triggered_by) as SyncRun["triggeredBy"],
    startedAt: new Date(asStr(r.started_at)).toISOString(),
    completedAt: r.completed_at ? new Date(asStr(r.completed_at)).toISOString() : null,
    rowsRead: asNum(r.rows_read),
    rowsChanged: asNum(r.rows_changed),
    itemsCreated: asNum(r.items_created),
    itemsUpdated: asNum(r.items_updated),
    warnings: asArr(r.warnings),
    errors: asArr(r.errors),
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

// ── Public API ────────────────────────────────────────────────────

export async function isDbConnected(): Promise<boolean> {
  const sql = await getSql();
  return sql != null;
}

export async function getLatestMetricSnapshot(videoId: string): Promise<ContentMetricSnapshot | null> {
  const sql = await getSql();
  if (!sql) {
    const rows = memMetricSnapshots
      .filter((s) => s.videoId === videoId)
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    return rows[0] ?? null;
  }
  try {
    const rows = await sql`SELECT * FROM content_metric_snapshots WHERE video_id = ${videoId} ORDER BY captured_at DESC LIMIT 1`;
    return rows[0] ? mapMetricSnapshot(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function getMetricSnapshots(videoId: string, range?: DateRange): Promise<ContentMetricSnapshot[]> {
  const sql = await getSql();
  if (!sql) {
    return memMetricSnapshots
      .filter(
        (s) =>
          s.videoId === videoId &&
          (!range || (s.capturedAt >= range.start && s.capturedAt <= range.end))
      )
      .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  }
  try {
    const rows = range
      ? await sql`SELECT * FROM content_metric_snapshots WHERE video_id = ${videoId} AND captured_at >= ${range.start} AND captured_at <= ${range.end} ORDER BY captured_at ASC`
      : await sql`SELECT * FROM content_metric_snapshots WHERE video_id = ${videoId} ORDER BY captured_at ASC`;
    return rows.map(mapMetricSnapshot);
  } catch {
    return [];
  }
}

export async function insertMetricSnapshot(snapshot: MetricSnapshotInput): Promise<ContentMetricSnapshot> {
  const full: ContentMetricSnapshot = {
    ...snapshot,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const sql = await getSql();
  if (!sql) {
    memMetricSnapshots.push(full);
    return full;
  }
  try {
    await sql`INSERT INTO content_metric_snapshots (
      id, video_id, creator_id, campaign_id, platform, captured_at, source, views,
      reported_impressions, estimated_impressions, reach, likes, comments, shares, saves,
      source_confidence, raw_payload, created_at
    ) VALUES (
      ${full.id}, ${full.videoId}, ${full.creatorId}, ${full.campaignId}, ${full.platform},
      ${full.capturedAt}, ${full.source}, ${full.views},
      ${full.reportedImpressions ?? null}, ${full.estimatedImpressions ?? null}, ${full.reach ?? null},
      ${full.likes ?? null}, ${full.comments ?? null}, ${full.shares ?? null}, ${full.saves ?? null},
      ${full.sourceConfidence}, ${JSON.stringify(full.rawPayload ?? null)}, ${full.createdAt}
    )`;
  } catch (err) {
    console.warn(`[storage] insertMetricSnapshot failed: ${err instanceof Error ? err.message : String(err)}`);
    memMetricSnapshots.push(full);
  }
  return full;
}

export async function createSyncRun(input: SyncRunInput): Promise<SyncRun> {
  const run: SyncRun = {
    id: crypto.randomUUID(),
    source: input.source,
    status: "running",
    triggeredBy: input.triggeredBy,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
  const sql = await getSql();
  if (!sql) {
    memSyncRuns.push(run);
    return run;
  }
  try {
    await sql`INSERT INTO sync_runs (id, source, status, triggered_by, started_at)
      VALUES (${run.id}, ${run.source}, ${run.status}, ${run.triggeredBy}, ${run.startedAt})`;
  } catch {
    memSyncRuns.push(run);
  }
  return run;
}

export async function updateSyncRun(id: string, patch: Partial<SyncRun>): Promise<void> {
  const sql = await getSql();
  if (!sql) {
    const idx = memSyncRuns.findIndex((r) => r.id === id);
    if (idx >= 0) memSyncRuns[idx] = { ...memSyncRuns[idx], ...patch };
    return;
  }
  try {
    await sql`UPDATE sync_runs SET
      status = COALESCE(${patch.status ?? null}, status),
      completed_at = COALESCE(${patch.completedAt ?? null}, completed_at),
      rows_read = COALESCE(${patch.rowsRead ?? null}, rows_read),
      rows_changed = COALESCE(${patch.rowsChanged ?? null}, rows_changed),
      items_created = COALESCE(${patch.itemsCreated ?? null}, items_created),
      items_updated = COALESCE(${patch.itemsUpdated ?? null}, items_updated),
      warnings = COALESCE(${patch.warnings ? JSON.stringify(patch.warnings) : null}, warnings),
      errors = COALESCE(${patch.errors ? JSON.stringify(patch.errors) : null}, errors),
      metadata = COALESCE(${patch.metadata ? JSON.stringify(patch.metadata) : null}, metadata)
      WHERE id = ${id}`;
  } catch (err) {
    console.warn(`[storage] updateSyncRun failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getLatestSyncRun(source: SyncSource): Promise<SyncRun | null> {
  const sql = await getSql();
  if (!sql) {
    const rows = memSyncRuns
      .filter((r) => r.source === source)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    return rows[0] ?? null;
  }
  try {
    const rows = await sql`SELECT * FROM sync_runs WHERE source = ${source} ORDER BY started_at DESC LIMIT 1`;
    return rows[0] ? mapSyncRun(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function listSyncRuns(limit = 50): Promise<SyncRun[]> {
  const sql = await getSql();
  if (!sql) {
    return [...memSyncRuns].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit);
  }
  try {
    const rows = await sql`SELECT * FROM sync_runs ORDER BY started_at DESC LIMIT ${limit}`;
    return rows.map(mapSyncRun);
  } catch {
    return [];
  }
}

export async function insertDubSnapshot(input: DubSnapshotInput): Promise<DubMetricSnapshot> {
  const full: DubMetricSnapshot = { ...input, id: crypto.randomUUID() };
  const sql = await getSql();
  if (!sql) {
    memDubSnapshots.push(full);
    return full;
  }
  try {
    await sql`INSERT INTO dub_metric_snapshots (
      id, slug, video_id, attribution_group_id, captured_at, interval, start_date, end_date,
      timezone, clicks, leads, sales, source, source_confidence, raw_payload, warnings
    ) VALUES (
      ${full.id}, ${full.slug}, ${full.videoId ?? null}, ${full.attributionGroupId ?? null},
      ${full.capturedAt}, ${full.interval ?? null}, ${full.start ?? null}, ${full.end ?? null},
      ${full.timezone}, ${full.clicks}, ${full.leads}, ${full.sales ?? null}, ${full.source},
      ${full.sourceConfidence}, ${JSON.stringify(full.rawPayload ?? null)},
      ${full.warnings ? JSON.stringify(full.warnings) : null}
    )`;
  } catch (err) {
    console.warn(`[storage] insertDubSnapshot failed: ${err instanceof Error ? err.message : String(err)}`);
    memDubSnapshots.push(full);
  }
  return full;
}

export async function getDubTimeseries(groupOrSlug: string, range?: DateRange): Promise<DubTimeseriesPoint[]> {
  const sql = await getSql();
  if (!sql) {
    return memDubTimeseries
      .filter(
        (p) =>
          (p.slug === groupOrSlug || p.attributionGroupId === groupOrSlug) &&
          (!range || (p.date >= range.start && p.date <= range.end))
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  try {
    const rows = range
      ? await sql`SELECT * FROM dub_timeseries_points WHERE (slug = ${groupOrSlug} OR attribution_group_id = ${groupOrSlug}) AND date >= ${range.start} AND date <= ${range.end} ORDER BY date ASC`
      : await sql`SELECT * FROM dub_timeseries_points WHERE (slug = ${groupOrSlug} OR attribution_group_id = ${groupOrSlug}) ORDER BY date ASC`;
    return rows.map((r) => ({
      id: asStr(r.id),
      slug: asStr(r.slug),
      attributionGroupId: asStrOrNull(r.attribution_group_id),
      date: asStr(r.date),
      eventType: asStr(r.event_type) as DubTimeseriesPoint["eventType"],
      count: asNum(r.count) ?? 0,
      fetchedAt: new Date(asStr(r.fetched_at)).toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function insertDubTimeseriesPoints(points: Omit<DubTimeseriesPoint, "id">[]): Promise<void> {
  if (points.length === 0) return;
  const sql = await getSql();
  if (!sql) {
    for (const p of points) {
      const existing = memDubTimeseries.findIndex(
        (e) => e.slug === p.slug && e.date === p.date && e.eventType === p.eventType
      );
      const withId: DubTimeseriesPoint = { ...p, id: crypto.randomUUID() };
      if (existing >= 0) memDubTimeseries[existing] = withId;
      else memDubTimeseries.push(withId);
    }
    return;
  }
  try {
    for (const p of points) {
      await sql`INSERT INTO dub_timeseries_points (id, slug, attribution_group_id, date, event_type, count, fetched_at)
        VALUES (${crypto.randomUUID()}, ${p.slug}, ${p.attributionGroupId ?? null}, ${p.date}, ${p.eventType}, ${p.count}, ${p.fetchedAt})
        ON CONFLICT (slug, date, event_type) DO UPDATE SET count = EXCLUDED.count, fetched_at = EXCLUDED.fetched_at`;
    }
  } catch (err) {
    console.warn(`[storage] insertDubTimeseriesPoints failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function mapInferred(r: Record<string, unknown>): InferredAttribution {
  return {
    id: asStr(r.id),
    attributionGroupId: asStr(r.attribution_group_id),
    creatorId: asStr(r.creator_id),
    videoId: asStr(r.video_id),
    sourceEventId: asStrOrNull(r.source_event_id),
    sourceDate: asStrOrNull(r.source_date),
    eventType: asStr(r.event_type) as InferredAttribution["eventType"],
    eventTimestamp: r.event_timestamp ? new Date(asStr(r.event_timestamp)).toISOString() : null,
    allocatedValue: asNum(r.allocated_value) ?? 0,
    probability: asNum(r.probability) ?? 0,
    method: asStr(r.method) as InferredAttribution["method"],
    confidence: asStr(r.confidence) as InferredAttribution["confidence"],
    explanation: asStr(r.explanation),
    computedAt: new Date(asStr(r.computed_at)).toISOString(),
  };
}

export async function insertInferredAttribution(input: InferredAttributionInput): Promise<InferredAttribution> {
  const full: InferredAttribution = { ...input, id: crypto.randomUUID() };
  const sql = await getSql();
  if (!sql) {
    memInferred.push(full);
    return full;
  }
  try {
    await sql`INSERT INTO inferred_attributions (
      id, attribution_group_id, creator_id, video_id, source_event_id, source_date, event_type,
      event_timestamp, allocated_value, probability, method, confidence, explanation, computed_at
    ) VALUES (
      ${full.id}, ${full.attributionGroupId}, ${full.creatorId}, ${full.videoId},
      ${full.sourceEventId ?? null}, ${full.sourceDate ?? null}, ${full.eventType},
      ${full.eventTimestamp ?? null}, ${full.allocatedValue}, ${full.probability}, ${full.method},
      ${full.confidence}, ${full.explanation}, ${full.computedAt}
    )`;
  } catch (err) {
    console.warn(`[storage] insertInferredAttribution failed: ${err instanceof Error ? err.message : String(err)}`);
    memInferred.push(full);
  }
  return full;
}

export async function getInferredAttributionForVideo(videoId: string): Promise<InferredAttribution[]> {
  const sql = await getSql();
  if (!sql) {
    return memInferred.filter((a) => a.videoId === videoId);
  }
  try {
    const rows = await sql`SELECT * FROM inferred_attributions WHERE video_id = ${videoId} ORDER BY computed_at DESC`;
    return rows.map(mapInferred);
  } catch {
    return [];
  }
}

export async function getInferredAttributionForGroup(groupId: string): Promise<InferredAttribution[]> {
  const sql = await getSql();
  if (!sql) {
    return memInferred.filter((a) => a.attributionGroupId === groupId);
  }
  try {
    const rows = await sql`SELECT * FROM inferred_attributions WHERE attribution_group_id = ${groupId} ORDER BY computed_at DESC`;
    return rows.map(mapInferred);
  } catch {
    return [];
  }
}

export async function clearInferredAttributionForGroup(groupId: string): Promise<void> {
  const sql = await getSql();
  if (!sql) {
    for (let i = memInferred.length - 1; i >= 0; i--) {
      if (memInferred[i].attributionGroupId === groupId) memInferred.splice(i, 1);
    }
    return;
  }
  try {
    await sql`DELETE FROM inferred_attributions WHERE attribution_group_id = ${groupId}`;
  } catch (err) {
    console.warn(`[storage] clearInferredAttributionForGroup failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
