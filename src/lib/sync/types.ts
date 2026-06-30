export type { SyncSource, SyncStatus, SyncRun, SyncResult, ContentMetricSnapshot, DubMetricSnapshot, DubTimeseriesPoint, InferredAttribution, InferredAttributionConfidence } from "@/types";

export interface SyncRunInput {
  source: import("@/types").SyncSource;
  triggeredBy: "cron" | "manual" | "system";
}

export type MetricSnapshotInput = Omit<import("@/types").ContentMetricSnapshot, "id" | "createdAt">;
export type DubSnapshotInput = Omit<import("@/types").DubMetricSnapshot, "id">;
export type InferredAttributionInput = Omit<import("@/types").InferredAttribution, "id">;

export interface DateRange {
  start: string;
  end: string;
}
