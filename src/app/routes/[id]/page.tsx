"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const RouteDetailScreen = dynamic(
  () => import("@/components/screens/RouteDetailScreen").then((mod) => mod.RouteDetailScreen),
  { ssr: false }
);

export default function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RouteDetailScreen routeId={id} />;
}
