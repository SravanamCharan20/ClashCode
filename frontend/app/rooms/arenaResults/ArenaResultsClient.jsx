"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

const verdictTone = (verdict) => {
  if (verdict === "AC") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (verdict === "WA") return "bg-red-50 text-red-700 ring-red-200";
  if (verdict === "TLE" || verdict === "MLE")
    return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
};

const ArenaResultsClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || "";
  const roomCode = searchParams.get("roomCode") || "";
  const notice = searchParams.get("notice") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [room, setRoom] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedVerdict, setSelectedVerdict] = useState("all");

  useEffect(() => {
    if (!roomId) {
      setError("Missing room id");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/room/${roomId}/results`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Unable to load results");
          return;
        }

        setRoom(data.room || null);
        setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
      } catch {
        setError("Something went wrong while loading results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [roomId]);

  const userOptions = useMemo(() => {
    const unique = new Map();
    submissions.forEach((submission) => {
      if (submission?.userId && !unique.has(submission.userId)) {
        unique.set(submission.userId, submission.username || "Participant");
      }
    });
    return [...unique.entries()].map(([userId, username]) => ({
      userId,
      username,
    }));
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      if (selectedUser !== "all" && submission.userId !== selectedUser) {
        return false;
      }
      if (selectedVerdict !== "all" && submission.verdict !== selectedVerdict) {
        return false;
      }
      return true;
    });
  }, [selectedUser, selectedVerdict, submissions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] px-6 py-24 text-sm text-gray-600">
        Loading contest results...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-10 lg:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Arena Results
              </p>
              <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight text-gray-950">
                {roomCode ? `Room ${roomCode}` : room?.roomCode ? `Room ${room.roomCode}` : "Contest"}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {notice === "room-terminated"
                  ? "Room was terminated by the admin. The final standings are shown below."
                  : "Contest completed. Review the final leaderboard and everyone’s submissions."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/contests")}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to contests
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to dashboard
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Final leaderboard
              </p>
              <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <div
                      key={`${entry.user}-${entry.rank}`}
                      className={`grid grid-cols-[54px_minmax(0,1fr)_84px] items-center gap-3 px-4 py-3 text-sm ${
                        index < 3 ? "bg-amber-50/40" : "bg-white"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                        #{entry.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {entry.username}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                          {entry.solved || 0} solved
                        </p>
                      </div>
                      <span className="text-right font-semibold text-gray-900">
                        {entry.score} pts
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-4 text-sm text-gray-500">
                    No leaderboard available.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Filters
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    User
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-900"
                  >
                    <option value="all">All participants</option>
                    {userOptions.map((option) => (
                      <option key={option.userId} value={option.userId}>
                        {option.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Verdict
                  </label>
                  <select
                    value={selectedVerdict}
                    onChange={(e) => setSelectedVerdict(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-900"
                  >
                    <option value="all">All verdicts</option>
                    <option value="AC">AC</option>
                    <option value="WA">WA</option>
                    <option value="TLE">TLE</option>
                    <option value="MLE">MLE</option>
                    <option value="RE">RE</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Submission archive
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Expand any submission to review code. Use filters to narrow down.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => {
                  const isOpen = expandedId === submission.id;
                  return (
                    <div key={submission.id} className="px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {submission.username || "Participant"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {submission.language || "code"} •{" "}
                            {submission.problemId?.slice(-6) || "problem"} •{" "}
                            {submission.createdAt
                              ? new Date(submission.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${verdictTone(
                              submission.verdict,
                            )}`}
                          >
                            {submission.verdict}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === submission.id ? null : submission.id,
                              )
                            }
                            className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            {isOpen ? "Hide code" : "View code"}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-[#0b1020]">
                          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                              {submission.language} solution
                            </p>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    submission.code || "",
                                  );
                                } catch {
                                  // ignore clipboard failures
                                }
                              }}
                              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-100 hover:bg-white/15"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-5 text-slate-100">
                            {submission.code || "// No code captured"}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-sm text-gray-500">
                  No submissions match these filters.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ArenaResultsClient;

