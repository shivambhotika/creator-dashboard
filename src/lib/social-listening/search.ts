import { buildBooleanQuery, getSocialListeningConfig } from "@/lib/social-listening/config";
import { buildScreenshotUrl } from "@/lib/social-listening/screenshots";
import type {
  SocialDigest,
  SocialListeningConfig,
  SocialPost,
  SocialPostRelevance,
  SocialProviderResult,
  SocialSource,
} from "@/lib/social-listening/types";

const USER_AGENT = "WisprFlowSocialDigest/1.0";

function normalize(text: string): string {
  return text.toLowerCase();
}

function makeId(source: SocialSource, url: string): string {
  return `${source}:${url}`;
}

function matchedTerms(text: string, terms: string[]): string[] {
  const lower = normalize(text);
  return terms.filter((term) => lower.includes(normalize(term)));
}

function relevance(matches: string[], includeMatches: string[]): SocialPostRelevance {
  if (matches.length >= 2 || includeMatches.length > 0) return "high";
  if (matches.length === 1) return "medium";
  return "low";
}

function isExcluded(text: string, config: SocialListeningConfig): boolean {
  const lower = normalize(text);
  return config.excludeTerms.some((term) => lower.includes(normalize(term)));
}

function isRelevant(text: string, config: SocialListeningConfig): boolean {
  if (isExcluded(text, config)) return false;
  const keywordMatches = matchedTerms(text, config.keywords);
  if (keywordMatches.length > 0) return true;
  return config.includeTerms.length > 0 && matchedTerms(text, config.includeTerms).length > 0;
}

function withDerivedFields(post: Omit<SocialPost, "id" | "matchedTerms" | "relevance" | "screenshotUrl">, config: SocialListeningConfig): SocialPost | null {
  const combined = `${post.title}\n${post.author ?? ""}\n${post.text}\n${post.url}`;
  if (!isRelevant(combined, config)) return null;
  const keywordMatches = matchedTerms(combined, config.keywords);
  const includeMatches = matchedTerms(combined, config.includeTerms);
  return {
    ...post,
    id: makeId(post.source, post.url),
    matchedTerms: Array.from(new Set([...keywordMatches, ...includeMatches])),
    relevance: relevance(keywordMatches, includeMatches),
    screenshotUrl: buildScreenshotUrl(post.url),
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": USER_AGENT,
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

function recentEnough(createdAt: string | undefined, since: Date): boolean {
  if (!createdAt) return true;
  return new Date(createdAt).getTime() >= since.getTime();
}

async function searchReddit(config: SocialListeningConfig, since: Date): Promise<SocialProviderResult> {
  if (!config.providers.reddit) return { source: "reddit", posts: [], warnings: ["Reddit provider disabled"] };

  const query = buildBooleanQuery(config.keywords);
  const targets = config.redditSubreddits.length > 0 ? config.redditSubreddits : [null];
  const warnings: string[] = [];
  const posts: SocialPost[] = [];

  for (const subreddit of targets) {
    const base = subreddit ? `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json` : "https://www.reddit.com/search.json";
    const params = new URLSearchParams({
      q: query,
      sort: "new",
      t: "day",
      limit: String(Math.min(config.maxItems, 25)),
      restrict_sr: subreddit ? "1" : "0",
    });
    try {
      const json = await fetchJson<{
        data?: {
          children?: Array<{
            data?: {
              id?: string;
              title?: string;
              selftext?: string;
              author?: string;
              permalink?: string;
              created_utc?: number;
              score?: number;
              num_comments?: number;
            };
          }>;
        };
      }>(`${base}?${params.toString()}`);

      for (const child of json.data?.children ?? []) {
        const item = child.data;
        if (!item?.permalink) continue;
        const createdAt = item.created_utc ? new Date(item.created_utc * 1000).toISOString() : undefined;
        if (!recentEnough(createdAt, since)) continue;
        const post = withDerivedFields({
          source: "reddit",
          title: item.title ?? "Reddit post",
          author: item.author ? `u/${item.author}` : undefined,
          url: `https://www.reddit.com${item.permalink}`,
          text: item.selftext ?? "",
          createdAt,
          score: item.score,
          comments: item.num_comments,
          timeConfidence: createdAt ? "exact" : "provider_24h",
        }, config);
        if (post) posts.push(post);
      }
    } catch (err) {
      warnings.push(`Reddit search failed${subreddit ? ` for r/${subreddit}` : ""}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { source: "reddit", posts, warnings };
}

async function searchXOfficial(config: SocialListeningConfig, since: Date): Promise<SocialProviderResult> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return { source: "x", posts: [], warnings: ["X_BEARER_TOKEN not configured"] };

  const query = `(${buildBooleanQuery(config.keywords)}) -is:retweet`;
  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(Math.max(config.maxItems, 10), 100)),
    "tweet.fields": "created_at,public_metrics,entities",
    expansions: "author_id",
    "user.fields": "username,name",
    start_time: since.toISOString(),
  });

  try {
    const json = await fetchJson<{
      data?: Array<{ id: string; text: string; created_at?: string; author_id?: string; public_metrics?: { like_count?: number; reply_count?: number; retweet_count?: number } }>;
      includes?: { users?: Array<{ id: string; username?: string; name?: string }> };
    }>(`https://api.twitter.com/2/tweets/search/recent?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const users = new Map((json.includes?.users ?? []).map((user) => [user.id, user]));
    const posts = (json.data ?? []).flatMap((tweet) => {
      const user = tweet.author_id ? users.get(tweet.author_id) : undefined;
      const username = user?.username;
      const url = username ? `https://x.com/${username}/status/${tweet.id}` : `https://x.com/i/web/status/${tweet.id}`;
      const post = withDerivedFields({
        source: "x",
        title: tweet.text.slice(0, 90),
        author: username ? `@${username}` : user?.name,
        url,
        text: tweet.text,
        createdAt: tweet.created_at,
        score: tweet.public_metrics?.like_count,
        comments: tweet.public_metrics?.reply_count,
        timeConfidence: tweet.created_at ? "exact" : "provider_24h",
      }, config);
      return post ? [post] : [];
    });
    return { source: "x", posts, warnings: [] };
  } catch (err) {
    return { source: "x", posts: [], warnings: [`X recent search failed: ${err instanceof Error ? err.message : String(err)}`] };
  }
}

async function searchMcpBridge(config: SocialListeningConfig, since: Date): Promise<SocialProviderResult> {
  const endpoint = process.env.SOCIAL_MCP_SEARCH_URL;
  if (!endpoint) return { source: "x", posts: [], warnings: ["SOCIAL_MCP_SEARCH_URL not configured"] };

  try {
    const json = await fetchJson<{
      posts?: Array<{
        source?: SocialSource;
        title?: string;
        text?: string;
        author?: string;
        url?: string;
        createdAt?: string;
        score?: number;
        comments?: number;
      }>;
    }>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SOCIAL_MCP_API_KEY ? { Authorization: `Bearer ${process.env.SOCIAL_MCP_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        query: buildBooleanQuery(config.keywords),
        since: since.toISOString(),
        sources: ["x", "twitter"],
        limit: config.maxItems,
      }),
    });

    const posts = (json.posts ?? []).flatMap((item) => {
      if (!item.url) return [];
      if (item.createdAt && !recentEnough(item.createdAt, since)) return [];
      const post = withDerivedFields({
        source: item.source === "linkedin" || item.source === "reddit" ? item.source : "x",
        title: item.title ?? item.text?.slice(0, 90) ?? "Social post",
        author: item.author,
        url: item.url,
        text: item.text ?? "",
        createdAt: item.createdAt,
        score: item.score,
        comments: item.comments,
        timeConfidence: item.createdAt ? "exact" : "provider_24h",
      }, config);
      return post ? [post] : [];
    });
    return { source: "x", posts, warnings: [] };
  } catch (err) {
    return { source: "x", posts: [], warnings: [`Social MCP bridge failed: ${err instanceof Error ? err.message : String(err)}`] };
  }
}

async function searchLinkedIn(config: SocialListeningConfig, since: Date): Promise<SocialProviderResult> {
  const endpoint = process.env.LINKEDIN_SEARCH_API_URL;
  const warnings: string[] = [];

  if (endpoint) {
    try {
      const json = await fetchJson<{
        posts?: Array<{ title?: string; text?: string; author?: string; url?: string; createdAt?: string; score?: number; comments?: number }>;
      }>(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.LINKEDIN_SEARCH_API_KEY ? { Authorization: `Bearer ${process.env.LINKEDIN_SEARCH_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          query: buildBooleanQuery(config.keywords),
          since: since.toISOString(),
          limit: config.maxItems,
        }),
      });
      const posts = (json.posts ?? []).flatMap((item) => {
        if (!item.url || !recentEnough(item.createdAt, since)) return [];
        const post = withDerivedFields({
          source: "linkedin",
          title: item.title ?? item.text?.slice(0, 90) ?? "LinkedIn post",
          author: item.author,
          url: item.url,
          text: item.text ?? "",
          createdAt: item.createdAt,
          score: item.score,
          comments: item.comments,
          timeConfidence: item.createdAt ? "exact" : "provider_24h",
        }, config);
        return post ? [post] : [];
      });
      return { source: "linkedin", posts, warnings };
    } catch (err) {
      warnings.push(`LinkedIn search bridge failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const serpKey = process.env.SERPAPI_KEY;
  if (!serpKey) return { source: "linkedin", posts: [], warnings: [...warnings, "LINKEDIN_SEARCH_API_URL or SERPAPI_KEY not configured"] };

  try {
    const params = new URLSearchParams({
      engine: "google",
      api_key: serpKey,
      q: `site:linkedin.com/posts (${buildBooleanQuery(config.keywords)})`,
      tbs: "qdr:d",
      num: String(Math.min(config.maxItems, 10)),
    });
    const json = await fetchJson<{
      organic_results?: Array<{ title?: string; link?: string; snippet?: string; displayed_link?: string }>;
    }>(`https://serpapi.com/search.json?${params.toString()}`);
    const posts = (json.organic_results ?? []).flatMap((item) => {
      if (!item.link) return [];
      const post = withDerivedFields({
        source: "linkedin",
        title: item.title ?? "LinkedIn result",
        url: item.link,
        text: item.snippet ?? "",
        timeConfidence: "provider_24h",
      }, config);
      return post ? [post] : [];
    });
    return { source: "linkedin", posts, warnings };
  } catch (err) {
    return { source: "linkedin", posts: [], warnings: [...warnings, `LinkedIn SerpAPI search failed: ${err instanceof Error ? err.message : String(err)}`] };
  }
}

function dedupe(posts: SocialPost[]): SocialPost[] {
  const seen = new Set<string>();
  const out: SocialPost[] = [];
  for (const post of posts) {
    const key = post.url.replace(/[?#].*$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(post);
  }
  return out;
}

export async function buildSocialDigest(): Promise<SocialDigest> {
  const config = getSocialListeningConfig();
  const until = new Date();
  const since = new Date(until.getTime() - config.hours * 60 * 60 * 1000);

  const xProviders: Promise<SocialProviderResult>[] = [];
  if (config.providers.xMcp) xProviders.push(searchMcpBridge(config, since));
  if (config.providers.x || !config.providers.xMcp) xProviders.push(searchXOfficial(config, since));

  const results = await Promise.all([
    ...xProviders,
    searchLinkedIn(config, since),
    searchReddit(config, since),
  ]);

  const posts = dedupe(results.flatMap((result) => result.posts))
    .sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (bd !== ad) return bd - ad;
      const relevanceRank = { high: 3, medium: 2, low: 1 };
      return relevanceRank[b.relevance] - relevanceRank[a.relevance];
    })
    .slice(0, config.maxItems);

  return {
    generatedAt: until.toISOString(),
    since: since.toISOString(),
    until: until.toISOString(),
    config,
    posts,
    warnings: results.flatMap((result) => result.warnings),
    sentToSlack: false,
  };
}
