"use client";

import { useState } from "react";
import { ExternalLink, Image as ImageIcon, Loader2, RefreshCw, Send } from "lucide-react";
import type { SocialDigest, SocialPost } from "@/lib/social-listening/types";

type LoadState = "idle" | "loading" | "sending" | "error" | "ok";

function sourceLabel(source: SocialPost["source"]): string {
  if (source === "x") return "X";
  if (source === "linkedin") return "LinkedIn";
  return "Reddit";
}

function formatDate(value?: string): string {
  if (!value) return "Time unknown";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SocialListeningClient() {
  const [state, setState] = useState<LoadState>("idle");
  const [digest, setDigest] = useState<SocialDigest | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(send = false) {
    setState(send ? "sending" : "loading");
    setError(null);
    try {
      const res = await fetch("/api/social-listening/digest", { method: send ? "POST" : "GET" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDigest(json as SocialDigest);
      setState("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => load(false)}
          disabled={state === "loading" || state === "sending"}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors flex items-center gap-2"
        >
          {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Preview latest digest
        </button>
        <button
          onClick={() => load(true)}
          disabled={state === "loading" || state === "sending"}
          className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-2"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}
        >
          {state === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send to Slack
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-4 text-sm text-red-500" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {error}
        </div>
      )}

      {digest && (
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {digest.posts.length} relevant posts
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {formatDate(digest.since)} to {formatDate(digest.until)} IST
                </p>
              </div>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  background: digest.sentToSlack ? "#10b98122" : "var(--bg-surface)",
                  color: digest.sentToSlack ? "#10b981" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Slack {digest.sentToSlack ? "sent" : "not sent"}
              </span>
            </div>
            {digest.warnings.length > 0 && (
              <div className="mt-3 space-y-1">
                {digest.warnings.map((warning) => (
                  <p key={warning} className="text-xs" style={{ color: "#f59e0b" }}>
                    {warning}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {digest.posts.length === 0 && (
              <div className="rounded-xl p-5 text-sm" style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                No relevant posts found for this window.
              </div>
            )}
            {digest.posts.map((post) => (
              <article key={post.id} className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                        {sourceLabel(post.source)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(post.createdAt)}</span>
                      {post.author && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{post.author}</span>}
                      <span className="text-xs capitalize" style={{ color: post.relevance === "high" ? "#10b981" : "#f59e0b" }}>{post.relevance}</span>
                    </div>
                    <a href={post.url} target="_blank" rel="noreferrer" className="font-semibold text-sm hover:underline" style={{ color: "var(--text-primary)" }}>
                      {post.title}
                    </a>
                    {post.text && (
                      <p className="text-sm mt-2 line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                        {post.text}
                      </p>
                    )}
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      Matched: {post.matchedTerms.join(", ") || "keyword"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {post.screenshotUrl && (
                      <a
                        href={post.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center border"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-surface)" }}
                        title="Open screenshot"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)", background: "var(--bg-surface)" }}
                      title="Open post"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
