import type { SocialDigest, SocialPost, SocialSource } from "@/lib/social-listening/types";

type SlackText = {
  type: "plain_text" | "mrkdwn";
  text: string;
  emoji?: boolean;
};

type SlackBlock =
  | { type: "header"; text: SlackText }
  | { type: "context"; elements: SlackText[] }
  | { type: "divider" }
  | {
      type: "section";
      text: SlackText;
      accessory?: {
        type: "image";
        image_url: string;
        alt_text: string;
      };
    };

export interface SlackSendResult {
  sent: boolean;
  warning?: string;
}

const SOURCE_LABELS: Record<SocialSource, string> = {
  x: "X",
  linkedin: "LinkedIn",
  reddit: "Reddit",
};

function escapeSlack(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(value: string, max = 240): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function slackLink(url: string, label: string): string {
  const safeUrl = url.replace(/>/g, "%3E");
  return `<${safeUrl}|${escapeSlack(label).replace(/\|/g, "-")}>`;
}

function formatDate(value?: string): string {
  if (!value) return "time unknown";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPost(post: SocialPost, index: number): SlackBlock {
  const title = truncate(post.title || post.text || post.url, 120);
  const meta = [
    `*${index + 1}. ${SOURCE_LABELS[post.source]}*`,
    post.author ? escapeSlack(post.author) : null,
    formatDate(post.createdAt),
    post.score != null ? `${post.score.toLocaleString("en-IN")} score` : null,
    post.comments != null ? `${post.comments.toLocaleString("en-IN")} comments` : null,
    post.matchedTerms.length ? `matched ${escapeSlack(post.matchedTerms.join(", "))}` : null,
  ].filter(Boolean).join(" · ");
  const body = truncate(post.text || post.title, 320);

  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${meta}\n${slackLink(post.url, title)}${body ? `\n>${escapeSlack(body)}` : ""}`,
    },
    ...(post.screenshotUrl
      ? {
          accessory: {
            type: "image" as const,
            image_url: post.screenshotUrl,
            alt_text: `${SOURCE_LABELS[post.source]} post screenshot`,
          },
        }
      : {}),
  };
}

function buildBlocks(digest: SocialDigest): SlackBlock[] {
  const generated = formatDate(digest.generatedAt);
  const enabledSources = [
    digest.config.providers.xMcp ? "X MCP" : null,
    digest.config.providers.x ? "X API" : null,
    digest.config.providers.linkedin ? "LinkedIn" : null,
    digest.config.providers.reddit ? "Reddit" : null,
    digest.config.screenshotEnabled ? "screenshots" : null,
  ].filter(Boolean).join(", ") || "Reddit only";

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `WisprFlow social digest: last ${digest.config.hours}h`, emoji: false },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${digest.posts.length} relevant posts · generated ${generated} IST · sources: ${escapeSlack(enabledSources)}`,
        },
      ],
    },
    { type: "divider" },
  ];

  if (digest.posts.length === 0) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: "No relevant posts found in the last 24 hours." },
    });
  } else {
    blocks.push(...digest.posts.slice(0, 20).map(formatPost));
  }

  const warnings = digest.warnings.filter(Boolean).slice(0, 4);
  if (warnings.length > 0) {
    blocks.push(
      { type: "divider" },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `Warnings: ${escapeSlack(warnings.join(" · "))}` }],
      }
    );
  }

  return blocks.slice(0, 48);
}

export async function sendSocialDigestToSlack(digest: SocialDigest): Promise<SlackSendResult> {
  const webhook = process.env.SLACK_SOCIAL_DIGEST_WEBHOOK_URL;
  if (!webhook) return { sent: false, warning: "SLACK_SOCIAL_DIGEST_WEBHOOK_URL not configured" };

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `WisprFlow social digest: ${digest.posts.length} relevant posts in the last ${digest.config.hours}h`,
      blocks: buildBlocks(digest),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      sent: false,
      warning: `Slack webhook failed: ${res.status} ${res.statusText}${body ? ` (${truncate(body, 160)})` : ""}`,
    };
  }

  return { sent: true };
}
