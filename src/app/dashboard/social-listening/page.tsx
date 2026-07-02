import { Bell, Camera, CheckCircle, CircleAlert, MessageSquareText, Radio, Search } from "lucide-react";
import { getSocialListeningConfig } from "@/lib/social-listening/config";
import { SocialListeningClient } from "@/app/dashboard/social-listening/SocialListeningClient";

export const dynamic = "force-dynamic";

function StatusPill({ ready }: { ready: boolean }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-1 rounded-full"
      style={{
        background: ready ? "#10b98122" : "#f59e0b22",
        color: ready ? "#10b981" : "#f59e0b",
      }}
    >
      {ready ? "Ready" : "Needs setup"}
    </span>
  );
}

export default function SocialListeningPage() {
  const config = getSocialListeningConfig();
  const providers = [
    {
      label: "Slack",
      detail: "Daily digest destination",
      ready: config.slackConfigured,
      icon: MessageSquareText,
    },
    {
      label: "X MCP bridge",
      detail: "Primary Twitter/X-style provider",
      ready: config.providers.xMcp,
      icon: Radio,
    },
    {
      label: "X API fallback",
      detail: "Recent search via bearer token",
      ready: config.providers.x,
      icon: Search,
    },
    {
      label: "LinkedIn",
      detail: "Search bridge or SerpAPI",
      ready: config.providers.linkedin,
      icon: Bell,
    },
    {
      label: "Reddit",
      detail: "Public last-day search",
      ready: config.providers.reddit,
      icon: Search,
    },
    {
      label: "Screenshots",
      detail: "Screenshot URL template/provider",
      ready: config.screenshotEnabled,
      icon: Camera,
    },
  ];

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Social Digest</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Daily WisprFlow mention watch across X, LinkedIn, and Reddit.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {config.hours}h window · max {config.maxItems}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Schedule</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>08:30 IST</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>/api/cron/social-digest</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {config.keywords.map((term) => (
              <span key={term} className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                {term}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Filters</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Excluding {config.excludeTerms.join(", ") || "nothing"}.
          </p>
          {config.includeTerms.length > 0 && (
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Boosting {config.includeTerms.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map(({ label, detail, ready, icon: Icon }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{detail}</p>
                </div>
              </div>
              <StatusPill ready={ready} />
            </div>
          </div>
        ))}
      </div>

      {!config.slackConfigured && (
        <div className="rounded-xl p-4 flex gap-3" style={{ background: "#f59e0b14", border: "1px solid #f59e0b40" }}>
          <CircleAlert className="w-5 h-5 shrink-0" style={{ color: "#f59e0b" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Slack delivery is inactive until SLACK_SOCIAL_DIGEST_WEBHOOK_URL is set in the deployment environment.
          </p>
        </div>
      )}

      <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Digest Preview</h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Run the same search the daily Slack job will use.
          </p>
        </div>
        <SocialListeningClient />
      </div>
    </div>
  );
}
