import { getDubStats } from "@/lib/dub-server";
import { CostsClient } from "@/components/CostsClient";

export default async function CostsPage() {
  const dub = await getDubStats();
  const dubByVideo = Object.fromEntries(
    Object.entries(dub.byVideo).map(([vid, s]) => [vid, { clicks: s.clicks, leads: s.leads }])
  );
  return <CostsClient dubByVideo={dubByVideo} />;
}
