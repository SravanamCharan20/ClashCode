"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "../../auth/userContext";
import ProblemsPanel from "../components/ProblemsPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";
const scorePalette = ["320", "240", "190", "150", "110", "80"];

const ArenaClient = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const roomCode = searchParams.get("roomCode");
  const [participants, setParticipants] = useState([]);
  const [contestProblems, setContestProblems] = useState([]);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [editorCode, setEditorCode] = useState("");
  const [selectedTestCase, setSelectedTestCase] = useState(0);
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
          setError(data.message || "Unable to load arena");
          setLoading(false);
          return;
        }

        const problems = (data.room.problems || []).sort((a, b) => a.index - b.index);

        setParticipants(data.room.participants || []);
        setContestProblems(problems);
        setDuration(data.room.duration || null);

        if (problems.length > 0) {
          const firstProblem = problems[0].problem;
          setSelectedProblemId(firstProblem._id);
          setEditorCode(firstProblem.starterCode?.javascript || "");
        }
      } catch {
        setError("Something went wrong while loading the arena");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const selectedProblem = useMemo(() => {
    const selectedEntry = contestProblems.find(
      (entry) => entry.problem?._id === selectedProblemId,
    );

    return selectedEntry?.problem || contestProblems[0]?.problem || null;
  }, [contestProblems, selectedProblemId]);

  const leaderboard = participants.map((participant, index) => ({
    ...participant,
    rank: index + 1,
    solved: Math.max(0, Math.min(index, contestProblems.length)),
    score: scorePalette[index] || "60",
    isCurrentUser: participant.user?.toString() === user?._id?.toString(),
  }));

  const visibleTestCases = selectedProblem
    ? (selectedProblem.testCases || []).filter((testCase) => !testCase.isHidden)
    : [];

  const activeTestCase = visibleTestCases[selectedTestCase] || visibleTestCases[0];

  const handleProblemSelect = (problemId) => {
    const nextProblem = contestProblems.find((entry) => entry.problem?._id === problemId)?.problem;
    if (!nextProblem) return;

    setSelectedProblemId(problemId);
    setSelectedTestCase(0);
    setEditorCode(nextProblem.starterCode?.[selectedLanguage] || "");
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setSelectedTestCase(0);
    setEditorCode(selectedProblem?.starterCode?.[language] || "");
  };

  if (loading || userLoading) {
    return <div className="min-h-screen bg-gray-50 px-6 py-24">Loading arena...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
              Contest Arena
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">
              Live Contest Workspace
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Solve the selected room problems on the left and track standings on
              the right in a contest-style layout.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Room Code
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {roomCode || "Unavailable"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Players
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {participants.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Duration
              </p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {duration ? `${duration} min` : "Unavailable"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-6">
            <ProblemsPanel
              problems={contestProblems}
              selectedProblemId={selectedProblemId}
              onSelectProblem={handleProblemSelect}
              title="Problems Panel"
              subtitle="Contest Set"
            />

            {selectedProblem && (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedProblem.title}
                  </h2>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {(selectedProblem.difficulty || "easy").toUpperCase()}
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {selectedProblem.points || 100} pts
                  </span>
                </div>

                <p className="mt-6 text-sm leading-7 text-gray-600">
                  {selectedProblem.description}
                </p>

                {selectedProblem.examples?.[0] && (
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Example Input
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                        {selectedProblem.examples[0].input}
                      </pre>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Example Output
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                        {selectedProblem.examples[0].output}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Constraints
                  </p>
                  <div className="mt-4 space-y-3">
                    {(selectedProblem.constraints || []).map((constraint) => (
                      <div
                        key={constraint}
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                      >
                        {constraint}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="flex min-h-[820px] flex-col gap-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                    Leaderboard
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                    Arena Standings
                  </h2>
                </div>
                <p className="text-sm text-gray-500">
                  {participants.length} participant
                  {participants.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-gray-500">No users in this room yet.</p>
                ) : (
                  leaderboard.map((entry) => (
                    <div
                      key={entry.user}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${
                        entry.isCurrentUser
                          ? "border-black bg-gray-100"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                          #{entry.rank}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {entry.username}
                            {entry.isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-500">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs uppercase tracking-widest text-gray-500">
                            Solved {entry.solved}/{contestProblems.length}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-gray-500">
                          Score
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {entry.score}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col rounded-3xl border border-gray-200 bg-white shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                    Code Editor
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900">
                    {selectedProblem?.title || "Select a problem"}
                  </h2>
                </div>

                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <div className="flex-1 px-6 py-5">
                <textarea
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  spellCheck={false}
                  className="h-[360px] w-full rounded-2xl border border-gray-200 bg-[#0b1020] p-5 font-mono text-sm leading-7 text-gray-100 outline-none"
                />
              </div>

              <div className="border-t border-gray-200 px-6 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  {visibleTestCases.map((testCase, index) => (
                    <button
                      key={`${testCase.input}-${index}`}
                      onClick={() => setSelectedTestCase(index)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedTestCase === index
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Case {index + 1}
                    </button>
                  ))}
                </div>

                {activeTestCase && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Input
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                        {activeTestCase.input}
                      </pre>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        Expected Output
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                        {activeTestCase.output}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                    Run Code
                  </button>
                  <button className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-gray-900">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ArenaClient;
