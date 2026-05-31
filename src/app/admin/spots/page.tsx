import { Suspense } from "react";
import { AdminSpotsScreen } from "@/components/screens/AdminSpotsScreen";

export default function AdminSpotsPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" style={{ background: "#FAF8F5" }} />}>
      <AdminSpotsScreen />
    </Suspense>
  );
}
