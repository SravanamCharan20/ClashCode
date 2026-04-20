"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "../../auth/userContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

const ArenaClient = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const roomCode = searchParams.get("roomCode");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setError("Missing room id");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/room/${roomId}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Unable to load leaderboard");
          setLoading(false);
          return;
        }

        setParticipants(data.room.participants || []);
      } catch {
        setError("Something went wrong while loading the leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  if (loading || userLoading) {
    return <div className="min-h-screen bg-gray-50 px-6 py-24">Loading arena...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Contest Arena
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">
            Leaderboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Current participants in this contest room. This gives you a clean
            base to add real scores, solved counts, or timing later.
          </p>

          {error && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="mt-8 space-y-3">
            {participants.length === 0 ? (
              <p className="text-sm text-gray-500">No participants found.</p>
            ) : (
              participants.map((participant, index) => {
                const isCurrentUser =
                  participant.user?.toString() === user?._id?.toString();

                return (
                  <div
                    key={participant.user}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
                      isCurrentUser
                        ? "border-black bg-gray-100"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                        #{index + 1}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-gray-500">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-gray-500">
                          Ready to compete
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Score
                      </p>
                      <p className="text-sm font-semibold text-gray-900">0</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Room Details
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">
            Contest Summary
          </h2>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Room ID
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {roomId || "Unavailable"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Room Code
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {roomCode || "Unavailable"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Participants
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {participants.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Status
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Contest Running
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaClient;
