"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

export default function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/room/join-room`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to join room");
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
    <div className="min-h-screen bg-gray-50 px-6 py-24">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Room Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Join Room
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Enter a room code to join the lobby and see current participants.
        </p>

        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Room Code
          </label>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm uppercase text-gray-900 outline-none transition focus:border-black"
          />
        </div>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={loading || !roomCode.trim()}
          className="mt-8 w-full rounded-full bg-black py-3 text-sm font-medium text-white shadow-lg transition hover:bg-gray-900 disabled:opacity-60"
        >
          {loading ? "Joining..." : "Join Room"}
        </button>
      </div>
    </div>
  );
}
