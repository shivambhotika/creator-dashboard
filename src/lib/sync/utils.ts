export function makeSyncId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / MS_PER_DAY);
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setTime(d.getTime() + days * MS_PER_DAY);
  return d.toISOString();
}

export function toIST(utcDate: string): string {
  return new Date(utcDate).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSyncDuration(startedAt: string, completedAt: string): string {
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (!isFinite(ms) || ms < 0) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function mergeSyncWarnings(...results: Array<{ warnings: string[] }>): string[] {
  return results.flatMap((r) => r.warnings ?? []);
}
