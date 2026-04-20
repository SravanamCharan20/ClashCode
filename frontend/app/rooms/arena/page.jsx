import { Suspense } from "react";
import ArenaClient from "./ArenaClient";

export default function ArenaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 px-6 py-24">Loading arena...</div>}>
      <ArenaClient />
    </Suspense>
  );
}
