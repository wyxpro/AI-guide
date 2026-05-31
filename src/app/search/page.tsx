import { Suspense } from "react";
import { SearchScreen } from "@/components/screens/SearchScreen";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" style={{ background: "#FAF8F5" }} />}>
      <SearchScreen />
    </Suspense>
  );
}
