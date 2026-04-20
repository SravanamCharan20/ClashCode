"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

export default function CreateRoom() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/room/create-room`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }

      router.push(
        `/rooms/lobby?roomId=${data.room.id}&roomCode=${data.room.roomCode}`,
      );
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 px-6 py-24">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Admin Only
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">
            Create Room
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Start a new room, generate a code, and move directly into the lobby.
          </p>

          {error && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-8 w-full rounded-full bg-black py-3 text-sm font-medium text-white shadow-lg transition hover:bg-gray-900 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
