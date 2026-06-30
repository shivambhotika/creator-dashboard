import { Suspense } from "react";
import { getDubStats } from "@/lib/dub-server";
import { getAllCreatorMetrics } from "@/lib/mock-data";
import { CreatorsClient } from "./CreatorsClient";

export default async function CreatorsPage() {
  const dub = await getDubStats();
  const allMetrics = getAllCreatorMetrics(dub.byVideo);
  return (
    <Suspense>
      <CreatorsClient allMetrics={allMetrics} />
    </Suspense>
  );
}
