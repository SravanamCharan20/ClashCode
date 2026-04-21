"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../auth/userContext";
import ProblemsPanel from "../components/ProblemsPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";
const scorePalette = ["320", "240", "190", "150", "110", "80"];

const formatRemainingTime = (remainingSeconds) => {
  if (typeof remainingSeconds !== "number") {
    return "Not started";
  }

  const safeSeconds = Math.max(0, remainingSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s left`;
  }

  return `${minutes}m ${seconds}s left`;
};

const ArenaClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const initialRoomCode = searchParams.get("roomCode") || "";
  const [participants, setParticipants] = useState([]);
  const [contestProblems, setContestProblems] = useState([]);
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [duration, setDuration] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [initialRemainingSeconds, setInitialRemainingSeconds] = useState(null);
  const [roomStatus, setRoomStatus] = useState("waiting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [editorCode, setEditorCode] = useState("");
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [now, setNow] = useState(null);
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        let resolvedRoomId = roomId;
        let room = null;

        if (!resolvedRoomId) {
          const runningRoomRes = await fetch(`${API_URL}/room/running-room`, {
            credentials: "include",
          });

          if (runningRoomRes.ok) {
            const runningRoomData = await runningRoomRes.json();
            room = runningRoomData.room || null;
            resolvedRoomId = runningRoomData.room?.id || null;

            if (resolvedRoomId && room?.roomCode) {
              router.replace(`/rooms/arena?roomId=${resolvedRoomId}&roomCode=${room.roomCode}`);
            }
          }
        }

        if (!resolvedRoomId) {
          setError("No active contest found");
          setLoading(false);
          return;
        }

        if (!room) {
          const res = await fetch(`${API_URL}/room/${resolvedRoomId}`, {
            credentials: "include",
          });
          const data = await res.json();

          if (!res.ok) {
            setError(data.message || "Unable to load arena");
            setLoading(false);
            return;
          }

          room = data.room || {};
        }

        const problems = (room.problems || []).sort((a, b) => a.index - b.index);

        setParticipants(room.participants || []);
        setContestProblems(problems);
        setRoomCode(room.roomCode || initialRoomCode);
        setDuration(room.duration || null);
        setEndsAt(room.endsAt || null);
        setInitialRemainingSeconds(room.remainingSeconds ?? null);
        setRoomStatus(room.status || "waiting");

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
  }, [initialRoomCode, roomId, router]);

  useEffect(() => {
    if (!endsAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [endsAt]);

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

  const activeTestCase = visibleTestCases[selectedTestCase] || visibleTestCases[0] || null;
  const remainingSeconds = endsAt
    ? now === null
      ? initialRemainingSeconds
      : Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000))
    : initialRemainingSeconds;
  const isContestCompleted = roomStatus === "completed" || remainingSeconds === 0;

  const handleProblemSelect = (problemId) => {
    const nextProblem = contestProblems.find((entry) => entry.problem?._id === problemId)?.problem;

    if (!nextProblem) {
      return;
    }

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
    <div className="min-h-screen bg-gray-50 px-6 py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <div className="rounded-[32px] border border-gray-200 bg-white px-6 py-6 shadow-sm lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
                Contest Arena
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 lg:text-4xl">
                Focus on solving, not on finding your way around.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 lg:text-base">
                Problems stay visible on the left, the active challenge stays centered, and
                your editor and sample cases remain in one consistent workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 lg:w-auto"
            >
              Exit To Dashboard
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Room Code</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{roomCode || "-"}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Duration</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {duration ? `${duration} minutes` : "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Problems</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{contestProblems.length}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Participants</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{participants.length}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 md:col-span-3 xl:col-span-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Contest State</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {isContestCompleted ? "Contest completed" : formatRemainingTime(remainingSeconds)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </p>
        )}

        {isContestCompleted && !error && (
          <div className="rounded-[32px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
            This contest has ended, so it is no longer resumable as a running room. You can still
            review the selected problems and leaderboard from this page.
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <ProblemsPanel
              problems={contestProblems}
              selectedProblemId={selectedProblemId}
              onSelectProblem={handleProblemSelect}
              title="Contest Problems"
              subtitle="Navigate The Set"
            />

            <div className="rounded-[32px] border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
                    Leaderboard
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900">Room standings</h2>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Live room
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-gray-500">No participants available.</p>
                ) : (
                  leaderboard.map((entry) => (
                    <div
                      key={entry.user}
                      className={`rounded-2xl border px-4 py-4 ${
                        entry.isCurrentUser
                          ? "border-black bg-gray-100"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            #{entry.rank} {entry.username}
                            {entry.isCurrentUser && (
                              <span className="ml-2 text-xs font-medium text-gray-500">(You)</span>
                            )}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">
                            Solved {entry.solved}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                          {entry.score} pts
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
                    Active Problem
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                    {selectedProblem?.title || "No problem selected"}
                  </h2>
                </div>

                {selectedProblem && (
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {(selectedProblem.difficulty || "easy").toUpperCase()}
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      {selectedProblem.points || 100} pts
                    </span>
                  </div>
                )}
              </div>

              {selectedProblem ? (
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-sm leading-7 text-gray-600">{selectedProblem.description}</p>
                  </div>

                  {selectedProblem.examples?.length > 0 && (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {selectedProblem.examples.slice(0, 2).map((example, index) => (
                        <div
                          key={`${example.input}-${index}`}
                          className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                        >
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                            Example {index + 1}
                          </p>
                          <div className="mt-3 space-y-3 text-sm text-gray-700">
                            <div>
                              <p className="text-xs text-gray-500">Input</p>
                              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                                {example.input}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Output</p>
                              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                                {example.output}
                              </pre>
                            </div>
                            {example.explanation && (
                              <div>
                                <p className="text-xs text-gray-500">Explanation</p>
                                <p className="mt-1 text-sm text-gray-600">{example.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedProblem.constraints?.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                        Constraints
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        {selectedProblem.constraints.map((constraint, index) => (
                          <li key={`${constraint}-${index}`}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-6 text-sm text-gray-500">No contest problem has been assigned.</p>
              )}
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
                    Coding Workspace
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">
                    {selectedProblem?.title || "Editor"}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-black"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                  </select>

                  <button
                    type="button"
                    disabled={isContestCompleted}
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Run Code
                  </button>
                  <button
                    type="button"
                    disabled={isContestCompleted}
                    className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              </div>

              <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-[#0b1020]">
                  <textarea
                    value={editorCode}
                    onChange={(e) => setEditorCode(e.target.value)}
                    spellCheck={false}
                    disabled={isContestCompleted}
                    className="min-h-[460px] w-full resize-none bg-transparent p-5 font-mono text-sm leading-6 text-white outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
                      Sample Cases
                    </p>

                    {visibleTestCases.length === 0 ? (
                      <p className="mt-4 text-sm text-gray-500">No visible test cases for this problem.</p>
                    ) : (
                      <>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {visibleTestCases.map((_, index) => (
                            <button
                              key={`testcase-${index}`}
                              type="button"
                              onClick={() => setSelectedTestCase(index)}
                              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                selectedTestCase === index
                                  ? "bg-black text-white"
                                  : "bg-white text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Case {index + 1}
                            </button>
                          ))}
                        </div>

                        {activeTestCase && (
                          <div className="mt-4 space-y-4">
                            <div className="rounded-2xl border border-gray-200 bg-white p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Input</p>
                              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-700">
                                {activeTestCase.input}
                              </pre>
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-white p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Expected Output</p>
                              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-700">
                                {activeTestCase.output}
                              </pre>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
                      Flow Forward
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-gray-600">
                      <p>Creation: admin sets duration and selects a problem set.</p>
                      <p>Lobby: participants join, review the problem slate, and get ready.</p>
                      <p>Arena: everyone lands here together after start and works inside one stable workspace.</p>
                      <p>Next backend step: persist submissions, per-problem solve state, and live scoreboard updates through sockets.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaClient;
