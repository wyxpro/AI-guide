import { Suspense } from "react";
import { QAScreen } from "@/components/screens/QAScreen";

export default function QAPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" style={{ background: "#FAF8F5" }} />}>
      <QAScreen />
    </Suspense>
  );
}
