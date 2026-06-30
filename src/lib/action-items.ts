// Source of truth for open action items shown on Decision page and in Overview callout.
// Update this file when items are resolved or added.

export interface ActionItem {
  id: string;
  priority: "P0" | "P1" | "P2";
  text: string;
  resolved?: boolean;
}

export const ACTION_ITEMS: ActionItem[] = [
  {
    id: "ai-1",
    priority: "P0",
    text: "Create unique Dub slugs per video for Ishan, Nandini, and Anurag before next deal cycle.",
  },
  {
    id: "ai-2",
    priority: "P1",
    text: "Ask WLDD to fix Full Disclosure Dub slug — currently conflicts with financewithjobi (v53).",
  },
  {
    id: "ai-3",
    priority: "P1",
    text: "Confirm actual video URLs for v72 (Sheryians), v74 (Arsh Goyal), v75 (Code And Bug).",
  },
  {
    id: "ai-4",
    priority: "P2",
    text: "Request per-post breakdown for Anurag Bansal v93 (IG Reel 2) — currently aggregated with v79 total.",
  },
  {
    id: "ai-5",
    priority: "P2",
    text: "Separate v88 Ishan April video from June reporting (use contracted spend basis).",
  },
  {
    id: "ai-6",
    priority: "P2",
    text: "Connect revenue/LTV data to enable ROAS calculation.",
  },
];

export const OPEN_ACTION_ITEMS = ACTION_ITEMS.filter((a) => !a.resolved);
export const HIGH_PRIORITY_COUNT = OPEN_ACTION_ITEMS.filter(
  (a) => a.priority === "P0" || a.priority === "P1"
).length;

export const PRIORITY_COLOR: Record<ActionItem["priority"], string> = {
  P0: "#ef4444",
  P1: "#f59e0b",
  P2: "#3b82f6",
};
