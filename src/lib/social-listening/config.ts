import type { SocialListeningConfig } from "@/lib/social-listening/types";

const DEFAULT_KEYWORDS = [
  "WisprFlow",
  "Wispr Flow",
  "wisprflow.ai",
  "ref.wisprflow.ai",
  "Wispr AI",
];

function csv(value: string | undefined, fallback: string[] = []): string[] {
  if (!value) return fallback;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function intEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function getSocialListeningConfig(): SocialListeningConfig {
  const screenshotEnabled = Boolean(
    process.env.SOCIAL_SCREENSHOT_URL_TEMPLATE ||
    process.env.SCREENSHOTONE_ACCESS_KEY
  );

  return {
    keywords: csv(process.env.SOCIAL_LISTENING_KEYWORDS, DEFAULT_KEYWORDS),
    includeTerms: csv(process.env.SOCIAL_LISTENING_INCLUDE_TERMS),
    excludeTerms: csv(process.env.SOCIAL_LISTENING_EXCLUDE_TERMS, ["job opening", "hiring"]),
    redditSubreddits: csv(process.env.SOCIAL_LISTENING_REDDIT_SUBREDDITS),
    hours: intEnv("SOCIAL_LISTENING_LOOKBACK_HOURS", 24, 1, 72),
    maxItems: intEnv("SOCIAL_LISTENING_MAX_ITEMS", 20, 1, 50),
    screenshotEnabled,
    slackConfigured: Boolean(process.env.SLACK_SOCIAL_DIGEST_WEBHOOK_URL),
    providers: {
      x: Boolean(process.env.X_BEARER_TOKEN),
      xMcp: Boolean(process.env.SOCIAL_MCP_SEARCH_URL),
      linkedin: Boolean(process.env.LINKEDIN_SEARCH_API_URL || process.env.SERPAPI_KEY),
      reddit: process.env.SOCIAL_LISTENING_DISABLE_REDDIT !== "true",
    },
  };
}

export function buildBooleanQuery(terms: string[]): string {
  return terms
    .map((term) => term.includes(" ") ? `"${term}"` : term)
    .join(" OR ");
}
