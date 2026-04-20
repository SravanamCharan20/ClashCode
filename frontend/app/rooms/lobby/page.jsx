import { Suspense } from "react";
import LobbyClient from "./LobbyClient";

export default function LobbyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 px-6 py-24">Loading...</div>}>
      <LobbyClient />
    </Suspense>
  );
}
