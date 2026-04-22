import { Suspense } from "react";
import ArenaResultsClient from "./ArenaResultsClient";

export default function ArenaResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 px-6 py-24 text-sm text-gray-600">
          Loading contest results...
        </div>
      }
    >
      <ArenaResultsClient />
    </Suspense>
  );
}

