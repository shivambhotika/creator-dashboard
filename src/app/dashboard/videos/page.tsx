import { Suspense } from "react";
import { getDubStats } from "@/lib/dub-server";
import { VideosClient } from "./VideosClient";

export default async function VideosPage() {
  const dub = await getDubStats();
  const dubByVideo = Object.fromEntries(
    Object.entries(dub.byVideo).map(([vid, s]) => [vid, { clicks: s.clicks, leads: s.leads }])
  );
  return (
    <Suspense>
      <VideosClient dubByVideo={dubByVideo} />
    </Suspense>
  );
}
