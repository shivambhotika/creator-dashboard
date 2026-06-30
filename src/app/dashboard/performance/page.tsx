import { getDubStats } from "@/lib/dub-server";
import { PerformanceClient } from "@/components/PerformanceClient";

export default async function PerformancePage() {
  const dub = await getDubStats();
  const dubByVideo = Object.fromEntries(
    Object.entries(dub.byVideo).map(([vid, s]) => [vid, { clicks: s.clicks, leads: s.leads }])
  );
  return <PerformanceClient dubByVideo={dubByVideo} />;
}
