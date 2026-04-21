"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    availableProblems.forEach((problem) => {
      const tags = Array.isArray(problem.tags)
        ? problem.tags
        : Array.isArray(problem.tag)
          ? problem.tag
          : problem.tag
            ? [problem.tag]
            : [];
      tags.forEach((tag) => tagSet.add(String(tag).trim().toLowerCase()));
    });
    return Array.from(tagSet).filter(Boolean).sort();
  }, [availableProblems]);

  const filteredProblems = useMemo(() => {
    return availableProblems.filter((problem) => {
      const difficulty = (problem.difficulty || "easy").toLowerCase();
      const title = (problem.title || "").toLowerCase();
      const description = (problem.description || "").toLowerCase();
      const tags = Array.isArray(problem.tags)
        ? problem.tags.map((tag) => String(tag).toLowerCase())
        : Array.isArray(problem.tag)
          ? problem.tag.map((tag) => String(tag).toLowerCase())
          : problem.tag
            ? [String(problem.tag).toLowerCase()]
            : [];

      const matchesDifficulty =
        difficultyFilter === "all" || difficulty === difficultyFilter;
      const matchesTag = tagFilter === "all" || tags.includes(tagFilter);
      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm.toLowerCase()) ||
        description.includes(searchTerm.toLowerCase());

      return matchesDifficulty && matchesTag && matchesSearch;
    });
  }, [availableProblems, difficultyFilter, tagFilter, searchTerm]);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 lg:px-6">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Admin Workspace
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-gray-900">Create Contest Room</h1>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Selected</p>
                <p className="text-sm font-semibold text-gray-900">{selectedProblemIds.length} problems</p>
              </div>
            </div>
          </div>

          {error && (
            <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Contest Setup
              </p>
              <div className="mt-5 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                    <option value={180}>180 minutes</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Problems</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{selectedProblemIds.length}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Duration</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{duration} min</p>
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={loading || selectedProblemIds.length === 0}
                  className="w-full rounded-full bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Room"}
                </button>
              </div>
            </aside>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Problem Bank
                </p>
                <p className="text-xs font-medium text-gray-500">
                  Showing {filteredProblems.length} of {availableProblems.length}
                </p>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or keyword"
                  className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none"
                />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none"
                >
                  <option value="all">All difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none"
                >
                  <option value="all">All tags</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {pageLoading ? (
                <p className="mt-8 text-sm text-gray-500">Loading problems...</p>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {filteredProblems.map((problem) => {
                    const isSelected = selectedProblemIds.includes(problem._id);
                    const difficulty = (problem.difficulty || "easy").toLowerCase();
                    const difficultyTone =
                      difficulty === "hard"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : difficulty === "medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200";
                    const tags = Array.isArray(problem.tags)
                      ? problem.tags
                      : Array.isArray(problem.tag)
                        ? problem.tag
                        : problem.tag
                          ? [problem.tag]
                          : [];

                    return (
                      <button
                        key={problem._id}
                        type="button"
                        onClick={() => toggleProblem(problem._id)}
                        className={`rounded-2xl border p-5 text-left transition ${
                          isSelected
                            ? "border-gray-900 bg-gray-100"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {problem.title}
                            </p>
                          </div>

                          <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                            {problem.points || 100} pts
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${difficultyTone}`}
                          >
                            {difficulty}
                          </span>
                          {tags.slice(0, 2).map((tag) => (
                            <span
                              key={`${problem._id}-${tag}`}
                              className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                          {problem.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {!pageLoading && filteredProblems.length === 0 && (
                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  No problems match the selected filters.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
