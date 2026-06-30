export type Platform = "YouTube" | "Instagram" | "TikTok" | "Twitter/X" | "LinkedIn" | "Podcast";
export type CreatorStatus = "Active" | "Past" | "Negotiating" | "Paused";
export type CreatorTier = "Nano" | "Micro" | "Mid" | "Macro" | "Mega";
export type CampaignStatus = "Active" | "Paused" | "Ended" | "Planned";
export type AttributionSource = "Dub" | "Facebook" | "Google Ads" | "Manual" | "AppsFlyer" | "Branch";

export type AttributionLevel = "video" | "creator" | "campaign" | "shared" | "manual" | "unknown";
export type AttributionAllocationMethod = "direct" | "none" | "equal" | "views_weighted" | "manual" | "time_decay" | "unknown";
export type MetricConfidence = "high" | "medium" | "low" | "none";
export type MetricSource = "dub" | "platform" | "agency" | "manual" | "scrape" | "estimated" | "mock" | "missing";
export type CostConfidence = "actual" | "allocated" | "estimated" | "pending";
export type CostAllocationMethod = "direct" | "equal_split" | "tier_platform_weight" | "views_weighted" | "manual" | "unknown";
export type DataIssueSeverity = "critical" | "warning" | "info" | "resolved";
export type DataIssueType = "missing_url" | "missing_insights" | "shared_attribution" | "estimated_cost" | "estimated_views" | "scheduled_with_cost" | "live_without_metrics" | "stale_metrics" | "deleted_content" | "dub_missing" | "dub_failed" | "budget_mismatch" | "unknown_zero";

export interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  tier: CreatorTier;
  niche: string;
  agency: string;
  contactEmail: string;
  status: CreatorStatus;
  followers: number;
  avgViews: number;
  dubLinkSlug?: string;
  sheetUrl?: string;
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  totalBudget: number;
  totalSpend: number;
  status: CampaignStatus;
  primaryPlatform: Platform | "Multi";
  creatorIds: string[];
  goal: string;
}

export interface Video {
  id: string;
  creatorId: string;
  creatorName: string;
  campaignId: string;
  title: string;
  url: string;
  platform: Platform;
  goLiveDate: string;
  format: "Dedicated" | "Integration" | "Short" | "Story" | "Live";
  briefUrl?: string;
  status: "Live" | "Scheduled";
  dubLinkSlug?: string;
  topic?: string;
  hookType?: string;
  ctaType?: string;
  ctaTiming?: string;
  integrationType?: string;
  missingInsightReason?: string;
  confirmedDeleted?: boolean;
}

/** Raw performance per video — views, engagement */
export interface VideoPerformance {
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;         // Instagram saves
  reposts?: number;       // Instagram reposts
  watchTimeMinutes: number;
  avgWatchTimeSec?: number;
  skipRate?: number;      // % who swiped past
  accountsReached?: number;
  clickThroughs: number;  // clicks on the Dub link
  impressions?: number;   // for YouTube
  profileFollows?: number; // follows attributed to the video
  recordedAt: string;
  reportedImpressions?: number;
  estimatedImpressions?: number;
  viewSource?: MetricSource;
  impressionSource?: MetricSource;
}

/** Install attribution — sourced from Dub API */
export interface InstallRecord {
  id: string;
  videoId: string;
  creatorId: string;
  campaignId: string;
  installs: number;
  attributionSource: AttributionSource;
  date: string;
  revenue?: number;      // revenue attributed to these installs (LTV * installs)
}

/** Cost record per video */
export interface Cost {
  videoId: string;
  creatorId: string;
  campaignId: string;
  grossCost: number;
  agencyFee: number;
  netCost: number;
  currency: string;
  grossAmount?: number;
  netAmount?: number;
  fxRate?: number;
  fxRateDate?: string;
  gst?: number;
  tds?: number;
  agencyFeeAmount?: number;
  platformFee?: number;
  paymentStatus?: "paid" | "pending" | "partial" | "disputed";
  invoiceStatus?: "received" | "pending" | "not_applicable";
  invoiceUrl?: string;
  paymentDate?: string;
  costType?: "fixed" | "performance" | "hybrid";
  costConfidence?: CostConfidence;
  allocationMethod?: CostAllocationMethod;
}

/** Derived — computed at runtime */
export interface CreatorMetrics {
  creatorId: string;
  totalViews: number;
  totalClicks: number;
  totalInstalls: number;
  totalRevenue: number;
  totalSpend: number;
  cpi: number;           // net cost / installs
  cpv: number;           // net cost / views
  cpc: number;           // net cost / clicks
  clickToInstallRate: number;  // installs / clicks %
  viewToInstallRate: number;   // installs / views %
  roas: number;          // revenue / net spend
  engagementRate: number;
  efficiencyScore: number;     // 0–100 composite
  videoCount: number;
}

/** What the Dub API returns per link */
export interface DubLinkStats {
  id: string;
  shortLink: string;
  url: string;
  clicks: number;
  leads: number;
  sales: number;
  saleAmount: number;
  createdAt: string;
}

export interface AttributionGroup {
  id: string;
  name: string;
  level: AttributionLevel;
  videoIds: string[];
  creatorIds: string[];
  dubSlugs: string[];
  allocationMethod: AttributionAllocationMethod;
  warning?: string;
  confidence: MetricConfidence;
}

export interface DataIssue {
  id: string;
  entityType: "campaign" | "creator" | "video" | "cost" | "attribution" | "system";
  entityId: string;
  severity: DataIssueSeverity;
  issueType: DataIssueType;
  title: string;
  description: string;
  suggestedFix?: string;
  owner?: string;
  status: "open" | "in_progress" | "resolved" | "ignored";
}

export interface ResolvedMetric<T = number> {
  value: T | null;
  source: MetricSource;
  confidence: MetricConfidence;
  warning?: string;
}

export type AttributionCertainty = "exact" | "estimated" | "creator_level" | "unknown";
export type InferredAttributionConfidence = "exact" | "high_estimated" | "medium_estimated" | "low_estimated" | "unassigned";
export type SyncSource = "all" | "sheets" | "youtube" | "dub" | "attribution" | "data_quality";
export type SyncStatus = "queued" | "running" | "success" | "partial" | "failed";

export interface SyncRun {
  id: string;
  source: SyncSource;
  status: SyncStatus;
  triggeredBy: "cron" | "manual" | "system";
  startedAt: string;
  completedAt?: string | null;
  rowsRead?: number | null;
  rowsChanged?: number | null;
  itemsCreated?: number | null;
  itemsUpdated?: number | null;
  warnings?: string[];
  errors?: string[];
  metadata?: Record<string, unknown>;
}

export interface ContentMetricSnapshot {
  id: string;
  videoId: string;
  creatorId: string;
  campaignId: string;
  platform: "youtube" | "instagram" | "linkedin" | "unknown";
  capturedAt: string;
  source: "youtube_api" | "youtube_scrape" | "instagram_manual" | "linkedin_manual" | "google_sheet" | "manual" | "seed";
  views: number | null;
  reportedImpressions?: number | null;
  estimatedImpressions?: number | null;
  reach?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  sourceConfidence: "high" | "medium" | "low" | "none";
  rawPayload?: unknown;
  createdAt: string;
}

export interface DubMetricSnapshot {
  id: string;
  slug: string;
  videoId?: string | null;
  attributionGroupId?: string | null;
  capturedAt: string;
  interval?: string;
  start?: string | null;
  end?: string | null;
  timezone: string;
  clicks: number | null;
  leads: number | null;
  sales?: number | null;
  source: "dub";
  sourceConfidence: "high" | "medium" | "low";
  rawPayload?: unknown;
  warnings?: string[];
}

export interface DubTimeseriesPoint {
  id: string;
  slug: string;
  attributionGroupId?: string | null;
  date: string;
  eventType: "clicks" | "leads" | "sales";
  count: number;
  fetchedAt: string;
}

export interface InferredAttribution {
  id: string;
  attributionGroupId: string;
  creatorId: string;
  videoId: string;
  sourceEventId?: string | null;
  sourceDate?: string | null;
  eventType: "click" | "lead" | "install";
  eventTimestamp?: string | null;
  allocatedValue: number;
  probability: number;
  method: "unique_link_exact" | "time_window" | "time_window_view_velocity" | "timeseries_split" | "manual_override" | "creator_level_only" | "unassigned";
  confidence: InferredAttributionConfidence;
  explanation: string;
  computedAt: string;
}

export interface DubLinkMapping {
  slugs: string[];
  videoIds: string[];
  creatorId: string;
  attributionGroupId?: string;
  attributionLevel: "video" | "creator" | "shared" | "campaign";
  exactVideoAttribution: boolean;
  notes?: string;
}

export interface SyncResult {
  source: SyncSource;
  status: "success" | "partial" | "failed";
  rowsRead?: number;
  rowsChanged?: number;
  itemsCreated?: number;
  itemsUpdated?: number;
  warnings: string[];
  errors: string[];
  metadata?: Record<string, unknown>;
}
