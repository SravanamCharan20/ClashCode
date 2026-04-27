"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

export default function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [runningContest, setRunningContest] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadRunningContest = async () => {
      try {
        const res = await fetch(`${API_URL}/room/running-room`, {
          credentials: "include",
        });

        if (!res.ok) {
          setRunningContest(null);
          return;
        }

        const data = await res.json();
        setRunningContest(data.room || null);
      } catch {
        setRunningContest(null);
      }
    };

    loadRunningContest();
  }, []);

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

      if (data.room?.status === "started") {
        router.push(`/rooms/arena?roomId=${data.room.id}&roomCode=${data.room.roomCode}`);
        return;
      }

      router.push(`/rooms/lobby?roomId=${data.room.id}&roomCode=${data.room.roomCode}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeContest = () => {
    if (!runningContest?.id) return;
    router.push(
      `/rooms/arena?roomId=${runningContest.id}&roomCode=${runningContest.roomCode}`,
    );
  };

  const handleLeaveContest = async () => {
    const confirmed = window.confirm(
      "Leave this running contest? This removes you and your submissions from this contest.",
    );
    if (!confirmed) return;

    setLeaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/room/leave-running-room`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to leave running contest");
        return;
      }

      setRunningContest(null);
    } catch {
      setError("Something went wrong while leaving contest");
    } finally {
      setLeaving(false);
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
          Enter a room code to join the lobby.
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

        {runningContest && (
          <div className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Ongoing Contest
            </p>
            <h2 className="mt-2 text-lg font-semibold text-indigo-900">
              Room {runningContest.roomCode}
            </h2>
            <p className="mt-2 text-sm text-indigo-700">
              You already have a running contest. Resume it or leave it completely.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleResumeContest}
                className="w-full rounded-full bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Resume Contest
              </button>
              <button
                onClick={handleLeaveContest}
                disabled={leaving}
                className="w-full rounded-full border border-red-300 bg-white py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                {leaving ? "Leaving..." : "Leave Contest"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
