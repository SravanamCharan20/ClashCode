"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

export default function CreateRoom() {
  const router = useRouter();
  const [availableProblems, setAvailableProblems] = useState([]);
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [duration, setDuration] = useState(90);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`${API_URL}/problem`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Unable to load problems");
          setPageLoading(false);
          return;
        }

        setAvailableProblems(data.problems || []);
      } catch {
        setError("Something went wrong while loading problems");
      } finally {
        setPageLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const toggleProblem = (problemId) => {
    setSelectedProblemIds((current) =>
      current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId],
    );
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/room/create-room`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemIds: selectedProblemIds,
          duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to create room");
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
      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
              Admin Only
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-gray-900">
              Create Contest Room
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Choose the contest duration, pick the problem set, and launch a
              room that carries those settings into the lobby and arena.
            </p>
          </div>

          {error && (
            <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                Contest Settings
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">
                Room Configuration
              </h2>

              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-3 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                  <option value={180}>180 minutes</option>
                </select>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Selected Problems
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {selectedProblemIds.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Duration
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {duration} min
                  </p>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={loading || selectedProblemIds.length === 0}
                className="mt-8 w-full rounded-full bg-black py-3 text-sm font-medium text-white shadow-lg transition hover:bg-gray-900 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Room"}
              </button>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                Problem Bank
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">
                Select Contest Problems
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Ten dummy problems are available in the database. Select the set
                you want for this room.
              </p>

              {pageLoading ? (
                <p className="mt-8 text-sm text-gray-500">Loading problems...</p>
              ) : (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {availableProblems.map((problem) => {
                    const isSelected = selectedProblemIds.includes(problem._id);

                    return (
                      <button
                        key={problem._id}
                        type="button"
                        onClick={() => toggleProblem(problem._id)}
                        className={`rounded-2xl border p-5 text-left transition ${
                          isSelected
                            ? "border-black bg-gray-100"
                            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {problem.title}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">
                              {(problem.difficulty || "easy").toUpperCase()}
                            </p>
                          </div>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            {problem.points || 100} pts
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                          {problem.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
