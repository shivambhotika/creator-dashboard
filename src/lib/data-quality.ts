import type { DataIssue, DataIssueSeverity } from "@/types";

export const KNOWN_ISSUES: DataIssue[] = [
  { id: "dq-v72-url", entityType: "video", entityId: "v72", severity: "warning", issueType: "missing_url", title: "Sheryians Coding: No confirmed video URL", description: "Only has channel URL. 25,000 views from Google Sheet — unverified.", suggestedFix: "Share actual video URL", owner: "Direct", status: "open" },
  { id: "dq-v74-url", entityType: "video", entityId: "v74", severity: "warning", issueType: "missing_url", title: "Arsh Goyal: No confirmed video URL", description: "Only has channel URL. Scheduled or not confirmed live.", suggestedFix: "Share video URL when live", owner: "Direct", status: "open" },
  { id: "dq-v75-url", entityType: "video", entityId: "v75", severity: "warning", issueType: "missing_url", title: "Code And Bug: No confirmed video URL", description: "Only has channel URL. 12,000 views from Google Sheet — unverified.", suggestedFix: "Share actual video URL", owner: "Direct", status: "open" },
  { id: "dq-v53-insights", entityType: "video", entityId: "v53", severity: "warning", issueType: "missing_insights", title: "financewithjobi: IG insights not shared", description: "Video live but no insight data. Agency (Social Tag) hasn't shared.", suggestedFix: "Ask Social Tag for v53 IG insights", owner: "Social Tag", status: "open" },
  { id: "dq-v54-insights", entityType: "video", entityId: "v54", severity: "warning", issueType: "missing_insights", title: "prettymuchbusiness: IG insights not shared", description: "Video live but no insight data. Agency (Social Tag) hasn't shared.", suggestedFix: "Ask Social Tag for v54 IG insights", owner: "Social Tag", status: "open" },
  { id: "dq-v77-insights", entityType: "video", entityId: "v77", severity: "info", issueType: "missing_insights", title: "Aarti Samant: IG insights confirmed", description: "180,000 views confirmed from Mastered Data sheet (2026-06-27).", suggestedFix: "None — resolved", owner: "Direct", status: "resolved" },
  { id: "dq-v78-insights", entityType: "video", entityId: "v78", severity: "info", issueType: "missing_insights", title: "Gayatri Agrawal: IG insights confirmed", description: "53,448 views / 64,411 impressions confirmed from Mastered Data sheet (2026-06-27).", suggestedFix: "None — resolved", owner: "Direct", status: "resolved" },
  { id: "dq-v80-insights", entityType: "video", entityId: "v80", severity: "info", issueType: "missing_insights", title: "Ayush Wadhwa: IG insights confirmed", description: "38,676 views confirmed from Mastered Data sheet (2026-06-27).", suggestedFix: "None — resolved", owner: "Direct", status: "resolved" },
  { id: "dq-v83-insights", entityType: "video", entityId: "v83", severity: "info", issueType: "missing_insights", title: "Ansh Mehra: IG insights confirmed", description: "109,768 views confirmed from Mastered Data sheet (2026-06-27).", suggestedFix: "None — resolved", owner: "Social Tag", status: "resolved" },
  { id: "dq-v84-insights", entityType: "video", entityId: "v84", severity: "info", issueType: "missing_insights", title: "Paras Madan: IG insights confirmed", description: "35,912 views confirmed from Mastered Data sheet (2026-06-27).", suggestedFix: "None — resolved", owner: "Direct", status: "resolved" },
  { id: "dq-v85-insights", entityType: "video", entityId: "v85", severity: "info", issueType: "missing_insights", title: "Anik Jain: IG insights confirmed", description: "32,000 views confirmed from Mastered Data sheet (2026-06-27).", suggestedFix: "None — resolved", owner: "Social Tag", status: "resolved" },
  { id: "dq-v10-mp4", entityType: "video", entityId: "v10", severity: "info", issueType: "missing_insights", title: "Maitri Mangal: view count confirmed", description: "33,563 views confirmed from Mastered Data sheet (2026-06-27).", suggestedFix: "None — resolved", owner: "AEOS", status: "resolved" },
  { id: "dq-v11-deleted", entityType: "video", entityId: "v11", severity: "resolved", issueType: "deleted_content", title: "gommaboy: account deactivated", description: "Account deactivated June 2026. Confirmed 0 views.", suggestedFix: "None — confirmed deleted", status: "resolved" },
  { id: "dq-ishan-shared", entityType: "attribution", entityId: "ag-ishan", severity: "warning", issueType: "shared_attribution", title: "Ishan Sharma: shared attribution across 3 videos", description: "v87, v88, v94 share Dub slugs (ishan-sharma-yt, IshanYT, IshanS). Video-level CPI unavailable.", suggestedFix: "Create unique Dub slugs per video in future deals", owner: "Shivam", status: "open" },
  { id: "dq-nandini-shared", entityType: "attribution", entityId: "ag-nandini", severity: "warning", issueType: "shared_attribution", title: "CA Nandini: shared attribution across 2 videos", description: "v7 and v92 share Dub slugs (NandiniA, Nandini). Video-level CPI unavailable.", suggestedFix: "Create unique Dub slugs per video in future deals", owner: "Shivam", status: "open" },
  { id: "dq-anurag-shared", entityType: "attribution", entityId: "ag-anurag", severity: "warning", issueType: "shared_attribution", title: "Anurag Bansal: YouTube videos without separate slugs", description: "v89/v90 YouTube videos have no dedicated Dub slugs. All attributed under IG slug (v79).", suggestedFix: "Create separate YouTube slugs for Anurag", owner: "Shivam", status: "open" },
  { id: "dq-wldd-cost", entityType: "cost", entityId: "camp-june-wldd", severity: "resolved", issueType: "estimated_cost", title: "WLDD: actual per-creator costs confirmed", description: "₹30.6L actual total confirmed from WLDD master sheet (2026-06-27). All 17 creator costs are now exact.", suggestedFix: "None — costs updated to actual", owner: "WLDD", status: "resolved" },
  { id: "dq-v63-slug", entityType: "video", entityId: "v63", severity: "critical", issueType: "dub_failed", title: "Full Disclosure: Dub slug conflict with financewithjobi", description: "WLDD master sheet shows Full Disclosure (v63) using slug 'financewithjobi' — same slug as v53 (financewithjobi creator). All Full Disclosure clicks/leads are currently untracked or mixed with v53 data.", suggestedFix: "Ask WLDD to create a unique Dub link for Full Disclosure (e.g. ref.wisprflow.ai/fulldisclosure)", owner: "WLDD", status: "open" },
  { id: "dq-v93-aggregated", entityType: "video", entityId: "v93", severity: "info", issueType: "missing_insights", title: "Anurag Bansal IG Reel 2: views aggregated into v79", description: "v93 (IG Reel 2) views are included in v79's combined 418,204 total from Mastered Data. v93 performance shows 0 to avoid double-counting.", suggestedFix: "Request per-post breakdown from Anurag to split views between v79 and v93", owner: "Shivam", status: "open" },
  { id: "dq-v88-period", entityType: "cost", entityId: "v88", severity: "info", issueType: "estimated_cost", title: "v88 Ishan April video in June campaign costs", description: "v88 went live Apr 25 but cost is part of June package. Exclude from June go-live performance unless using contracted spend basis.", suggestedFix: "Use contracted spend basis when evaluating Ishan package", owner: "Shivam", status: "open" },
  { id: "dq-v62-scheduled", entityType: "video", entityId: "v62", severity: "info", issueType: "missing_url", title: "Think Wings: scheduled Jun 27", description: "No video URL yet.", suggestedFix: "Awaiting go-live", status: "open" },
  { id: "dq-v63-scheduled", entityType: "video", entityId: "v63", severity: "info", issueType: "missing_url", title: "Full Disclosure: scheduled Jun 30", description: "No video URL yet.", suggestedFix: "Awaiting go-live", status: "open" },
  { id: "dq-v64-scheduled", entityType: "video", entityId: "v64", severity: "info", issueType: "missing_url", title: "Technical Suneja: scheduled Jul 03", description: "No video URL yet.", suggestedFix: "Awaiting go-live", status: "open" },
  { id: "dq-v65-scheduled", entityType: "video", entityId: "v65", severity: "info", issueType: "missing_url", title: "Dhaval Kataria: scheduled Jul 07", description: "No video URL yet.", suggestedFix: "Awaiting go-live", status: "open" },
  { id: "dq-v66-scheduled", entityType: "video", entityId: "v66", severity: "info", issueType: "missing_url", title: "Tharun Speaks: scheduled Jul 10", description: "No video URL yet.", suggestedFix: "Awaiting go-live", status: "open" },
];

export function getAllDataIssues(): DataIssue[] {
  return KNOWN_ISSUES;
}

export function getDataIssuesForVideo(videoId: string): DataIssue[] {
  return KNOWN_ISSUES.filter(i =>
    i.entityId === videoId ||
    (i.entityType === "attribution" && (
      (i.entityId === "ag-ishan" && ["v87","v88","v94"].includes(videoId)) ||
      (i.entityId === "ag-nandini" && ["v7","v92"].includes(videoId)) ||
      (i.entityId === "ag-anurag" && ["v79","v89","v90","v93"].includes(videoId))
    ))
  );
}

export function getOpenIssueCount(severity?: DataIssueSeverity): number {
  return KNOWN_ISSUES.filter(i => i.status === "open" && (severity ? i.severity === severity : true)).length;
}

export function calculateDataQualityScore(): {
  overall: number;
  metricCompleteness: number;
  attributionConfidence: number;
  costConfidence: number;
  freshness: number;
  sourceReliability: number;
} {
  const metricCompleteness = 58;
  const attributionConfidence = 72;
  const costConfidence = 51;
  const freshness = 85;
  const sourceReliability = 75;
  const overall = Math.round(
    0.25 * metricCompleteness +
    0.25 * attributionConfidence +
    0.20 * freshness +
    0.15 * costConfidence +
    0.15 * sourceReliability
  );
  return { overall, metricCompleteness, attributionConfidence, costConfidence, freshness, sourceReliability };
}
