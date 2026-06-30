import { getDubStats } from "@/lib/dub-server";
import { AgencyClient } from "./AgencyClient";

export default async function AgencyPage() {
  const dub = await getDubStats();
  const dubByVideo = Object.fromEntries(
    Object.entries(dub.byVideo).map(([vid, s]) => [vid, { clicks: s.clicks, leads: s.leads }])
  );
  return <AgencyClient dubByVideo={dubByVideo} />;
}
