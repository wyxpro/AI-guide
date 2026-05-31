import { Suspense } from "react";
import { SpotDetailScreen } from "@/components/screens/SpotDetailScreen";

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-svh" style={{ background: "#FAF8F5" }} />}>
      <SpotDetailScreen spotId={id} />
    </Suspense>
  );
}
