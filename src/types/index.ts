export type Platform = "YouTube" | "Instagram" | "TikTok" | "Twitter/X" | "LinkedIn" | "Podcast";
export type CreatorStatus = "Active" | "Past" | "Negotiating" | "Paused";
export type CreatorTier = "Nano" | "Micro" | "Mid" | "Macro" | "Mega";
export type CampaignStatus = "Active" | "Paused" | "Ended" | "Planned";
export type AttributionSource = "Dub" | "Facebook" | "Google Ads" | "Manual" | "AppsFlyer" | "Branch";

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
  dubLinkId?: string;   // Dub short link ID for this creator
  dubLinkSlug?: string; // e.g. wispr.ai/ankur
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
  dubLinkId?: string;
  dubLinkSlug?: string;
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
