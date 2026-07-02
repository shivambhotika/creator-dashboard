export type SocialSource = "x" | "linkedin" | "reddit";
export type SocialPostRelevance = "high" | "medium" | "low";
export type SocialPostTimeConfidence = "exact" | "provider_24h" | "unknown";

export interface SocialPost {
  id: string;
  source: SocialSource;
  title: string;
  author?: string;
  url: string;
  text: string;
  createdAt?: string;
  score?: number;
  comments?: number;
  screenshotUrl?: string;
  relevance: SocialPostRelevance;
  matchedTerms: string[];
  timeConfidence: SocialPostTimeConfidence;
}

export interface SocialProviderResult {
  source: SocialSource;
  posts: SocialPost[];
  warnings: string[];
}

export interface SocialListeningConfig {
  keywords: string[];
  includeTerms: string[];
  excludeTerms: string[];
  redditSubreddits: string[];
  hours: number;
  maxItems: number;
  screenshotEnabled: boolean;
  slackConfigured: boolean;
  providers: {
    x: boolean;
    xMcp: boolean;
    linkedin: boolean;
    reddit: boolean;
  };
}

export interface SocialDigest {
  generatedAt: string;
  since: string;
  until: string;
  config: SocialListeningConfig;
  posts: SocialPost[];
  warnings: string[];
  sentToSlack: boolean;
}
