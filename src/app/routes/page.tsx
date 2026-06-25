"use client";

import dynamic from "next/dynamic";

const RoutesScreen = dynamic(
  () => import("@/components/screens/RoutesScreen").then((mod) => mod.RoutesScreen),
  { ssr: false }
);

export default function RoutesPage() {
  return <RoutesScreen />;
}
