"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

export default function ContestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/room/my-contests`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Unable to load contests");
          return;
        }

        setContests(Array.isArray(data.contests) ? data.contests : []);
      } catch {
        setError("Something went wrong while loading contests");
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 lg:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Contest Archive
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Your participated contests
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Revisit completed contests and open detailed arena results anytime.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 text-sm text-gray-500">
            Loading contests...
          </div>
        ) : contests.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 text-sm text-gray-500">
            No past contests found yet.
          </div>
        ) : (
          <div className="space-y-3">
            {contests.map((contest) => (
              <div
                key={contest.id}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Room {contest.roomCode}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {contest.status} • {contest.duration} min •{" "}
                      {contest.participantsCount} participants • {contest.problemsCount} problems
                    </p>
                  </div>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                    Rank #{contest.rank}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                      Score
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{contest.score} pts</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                      Solved
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{contest.solved}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                      Ended
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {contest.endedAt
                        ? new Date(contest.endedAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/rooms/arenaResults?roomId=${contest.id}&roomCode=${contest.roomCode}`,
                      )
                    }
                    className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    View Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

