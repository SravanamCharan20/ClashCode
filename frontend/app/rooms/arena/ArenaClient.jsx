"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import { useUser } from "../../auth/userContext";
import socket from "../../../sockets/socket.js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";
const scorePalette = [320, 240, 190, 150, 110, 80];

const formatRemainingTime = (remainingSeconds) => {
  if (typeof remainingSeconds !== "number") {
    return "--:--";
  }

  const safeSeconds = Math.max(0, remainingSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const ArenaClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const initialRoomCode = searchParams.get("roomCode") || "";
  const [activeRoomId, setActiveRoomId] = useState(roomId || "");
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
  const [codeDrafts, setCodeDrafts] = useState({});
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [terminating, setTerminating] = useState(false);
  const [now, setNow] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const { user, loading: userLoading } = useUser();
  const getDraftKey = (problemId, language) => `${problemId}:${language}`;

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
              router.replace(
                `/rooms/arena?roomId=${resolvedRoomId}&roomCode=${room.roomCode}`,
              );
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

        const problems = (room.problems || []).sort(
          (a, b) => a.index - b.index,
        );

        setParticipants(room.participants || []);
        setContestProblems(problems);
        setActiveRoomId(resolvedRoomId || "");
        setRoomCode(room.roomCode || initialRoomCode);
        setDuration(room.duration || null);
        setEndsAt(room.endsAt || null);
        setInitialRemainingSeconds(room.remainingSeconds ?? null);
        setRoomStatus(room.status || "waiting");

        if (problems.length > 0) {
          const firstProblem = problems[0].problem;
          setSelectedProblemId(firstProblem._id);
          setCodeDrafts({
            [getDraftKey(firstProblem._id, "javascript")]:
              firstProblem.starterCode?.javascript || "",
            [getDraftKey(firstProblem._id, "python")]:
              firstProblem.starterCode?.python || "",
          });

          setEditorCode(firstProblem.starterCode?.javascript || "");
          setRunResult(null);
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

  useEffect(() => {
    const handleRoomTerminated = (payload) => {
      if (!payload?.roomId || payload.roomId !== activeRoomId) {
        return;
      }

      router.push(
        `/dashboard?notice=room-terminated&roomCode=${encodeURIComponent(
          payload.roomCode || roomCode || "",
        )}`,
      );
    };

    socket.on("room-terminated", handleRoomTerminated);

    return () => {
      socket.off("room-terminated", handleRoomTerminated);
    };
  }, [activeRoomId, roomCode, router]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const selectedProblemEntry = useMemo(
    () =>
      contestProblems.find(
        (entry) => entry.problem?._id === selectedProblemId,
      ) || contestProblems[0],
    [contestProblems, selectedProblemId],
  );

  const selectedProblem = selectedProblemEntry?.problem || null;

  const leaderboard = participants.map((participant, index) => ({
    ...participant,
    rank: index + 1,
    solved: Math.max(0, Math.min(index, contestProblems.length)),
    score: scorePalette[index] || 60,
    isCurrentUser: participant.user?.toString() === user?._id?.toString(),
  }));

  const visibleTestCases = selectedProblem
    ? (selectedProblem.testCases || []).filter((testCase) => !testCase.isHidden)
    : [];

  const activeTestCase =
    visibleTestCases[selectedTestCase] || visibleTestCases[0] || null;
  const remainingSeconds = endsAt
    ? now === null
      ? initialRemainingSeconds
      : Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000))
    : initialRemainingSeconds;
  const isAdmin = user?.role === "admin";
  const isContestCompleted =
    roomStatus === "completed" ||
    roomStatus === "terminated" ||
    remainingSeconds === 0;
  const contestProgress = duration
    ? Math.min(
        100,
        Math.max(
          0,
          ((duration * 60 - (remainingSeconds ?? duration * 60)) /
            (duration * 60)) *
            100,
        ),
      )
    : 0;

  const handleProblemSelect = (problemId) => {
    const nextProblem = contestProblems.find(
      (entry) => entry.problem?._id === problemId,
    )?.problem;

    if (!nextProblem) {
      return;
    }

    setSelectedProblemId(problemId);
    setSelectedTestCase(0);
    setRunResult(null);
    setEditorCode(
      codeDrafts[getDraftKey(problemId, selectedLanguage)] ||
        nextProblem.starterCode?.[selectedLanguage] ||
        "",
    );
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setSelectedTestCase(0);
    setRunResult(null);

    setEditorCode(
      codeDrafts[getDraftKey(selectedProblem?._id, language)] ||
        selectedProblem?.starterCode?.[language] ||
        "",
    );
  };

  const handleTerminateRoom = async () => {
    if (!activeRoomId || !isAdmin || terminating) {
      return;
    }

    const confirmed = window.confirm(
      "Terminate this room? This will end the contest and remove it from the running-room flow.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setTerminating(true);
      const res = await fetch(`${API_URL}/room/${activeRoomId}/terminate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to terminate room");
        setTerminating(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong while terminating the room");
      setTerminating(false);
    }
  };

  const handleRunCode = async () => {
    if (!activeRoomId || !selectedProblem?._id) {
      setRunResult({
        success: false,
        summary: "Select a valid room problem before running code",
        results: [],
      });
      return;
    }

    if (!editorCode.trim()) {
      setRunResult({
        success: false,
        summary: "Code cannot be empty",
        results: [],
      });
      return;
    }

    try {
      setRunLoading(true);
      setRunResult(null);

      const res = await fetch(`${API_URL}/exec/run-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          roomId: activeRoomId,
          problemId: selectedProblem._id,
          code: editorCode,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRunResult({
          success: false,
          summary: data.message || "Unable to run code",
          results: [],
        });
        return;
      }

      setRunResult({
        success: data.success,
        summary: data.summary,
        passedCount: data.passedCount,
        totalCount: data.totalCount,
        results: data.results || [],
      });
    } catch {
      setRunResult({
        success: false,
        summary: "Something went wrong while running code",
        results: [],
      });
    } finally {
      setRunLoading(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] px-6 py-24 text-sm text-gray-600">
        Loading arena...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900">
      <div className="border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
              Contest Arena
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-gray-950">
                {roomCode ? `Room ${roomCode}` : "Active Contest"}
              </h1>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                {participants.length} participants
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                {contestProblems.length} problems
              </span>
              {duration && (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                  {duration} min contest
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[180px] rounded-[24px] border border-black/5 bg-[#111827] px-4 py-3 text-white shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/60">
                Timer
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[0.08em]">
                {formatRemainingTime(remainingSeconds)}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${contestProgress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Exit to Dashboard
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={handleTerminateRoom}
                disabled={terminating || roomStatus === "terminated"}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {roomStatus === "terminated"
                  ? "Room Terminated"
                  : terminating
                    ? "Terminating..."
                    : "Terminate Room"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[calc(100vh-109px)] w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="min-h-0 overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-sm">
          <div className="border-b border-black/5 px-6 py-4 flex items-center justify-between">
            {/* LEFT: Pills */}
            <div className="flex items-center gap-3">
              {/* Problems Pill */}
              <div className="relative dropdown-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(
                      openDropdown === "problems" ? null : "problems",
                    );
                  }}
                  className="rounded-full bg-gray-950 text-white px-4 py-1.5 text-xs font-medium"
                >
                  Problems
                </button>

                {openDropdown === "problems" && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg z-50 animate-fadeIn"
                  >
                    {contestProblems.map((entry, index) => (
                      <div
                        key={entry.problem._id}
                        onClick={() => {
                          handleProblemSelect(entry.problem._id);
                          setOpenDropdown(null);
                        }}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {String.fromCharCode(65 + index)}. {entry.problem.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leaderboard Pill */}
              <div className="relative dropdown-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(
                      openDropdown === "leaderboard" ? null : "leaderboard",
                    );
                  }}
                  className="rounded-full border px-4 py-1.5 text-xs font-medium"
                >
                  Leaderboard
                </button>

                {openDropdown === "leaderboard" && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg z-50 right-0 animate-fadeIn"
                  >
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.user}
                        className="flex justify-between px-3 py-2 text-sm"
                      >
                        <span>
                          {entry.rank}. {entry.username}
                        </span>
                        <span>{entry.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Existing Title */}
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">
                Problem
              </p>
              <h2 className="text-lg font-semibold text-gray-950">
                {selectedProblem?.title || "No problem selected"}
              </h2>
            </div>
          </div>

          <div className="h-[calc(100%-112px)] overflow-y-auto px-6 py-6">
            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {isContestCompleted && !error && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {roomStatus === "terminated"
                  ? "This room was terminated by the admin. The workspace stays visible for review, but code actions are disabled."
                  : "This contest has ended. The workspace stays visible for review, but code actions are disabled."}
              </div>
            )}

            {selectedProblem ? (
              <div className="space-y-6">
                <div className="rounded-[24px] bg-[#fafafc] px-5 py-4 text-sm leading-7 text-gray-700">
                  {selectedProblem.description}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[24px] border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Input Format
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-700">
                      {selectedProblem.inputFormat || "Read input from standard input."}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Output Format
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-700">
                      {selectedProblem.outputFormat || "Write output to standard output."}
                    </p>
                  </div>
                </div>

                {selectedProblem.examples?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Examples
                    </h3>
                    {selectedProblem.examples.map((example, index) => (
                      <div
                        key={`${example.input}-${index}`}
                        className="rounded-[24px] border border-gray-200 bg-white p-5"
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          Example {index + 1}
                        </p>
                        <div className="mt-4 grid gap-4">
                          <div className="rounded-2xl bg-[#f5f5f7] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                              Input
                            </p>
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-800">
                              {example.input}
                            </pre>
                          </div>
                          <div className="rounded-2xl bg-[#f5f5f7] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                              Output
                            </p>
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-800">
                              {example.output}
                            </pre>
                          </div>
                          {example.explanation && (
                            <div className="rounded-2xl bg-[#f5f5f7] p-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                                Explanation
                              </p>
                              <p className="mt-2 text-sm leading-6 text-gray-700">
                                {example.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedProblem.constraints?.length > 0 && (
                  <div className="rounded-[24px] border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Constraints
                    </h3>
                    <div className="mt-4 space-y-3 text-sm text-gray-700">
                      {selectedProblem.constraints.map((constraint, index) => (
                        <p key={`${constraint}-${index}`}>{constraint}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No contest problem available.
              </p>
            )}
          </div>
        </section>

        <section className="min-h-0 overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-sm">
          <div className="border-b border-black/5 px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                  Code Editor
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Write a full stdin/stdout solution in contest style.
                </p>
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
                  disabled={isContestCompleted || runLoading}
                  onClick={handleRunCode}
                  className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {runLoading ? "Running..." : "Run Code"}
                </button>
                <button
                  type="button"
                  disabled={isContestCompleted}
                  className="rounded-full bg-gray-950 px-5 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          <div className="grid h-[calc(100%-89px)] grid-rows-[minmax(0,1fr)_260px]">
            <div className="h-full border-b border-black/5 bg-[#0a0f1a]">
              <Editor
                height="100%"
                language={
                  selectedLanguage === "javascript" ? "javascript" : "python"
                }
                value={editorCode}
                onChange={(value) => {
                  setCodeDrafts((prev) => ({
                    ...prev,
                    [getDraftKey(selectedProblem?._id, selectedLanguage)]: value || "",
                  }));
                  setEditorCode(value || "");
                }}
                theme="vs-dark"
                options={{
                  fontSize: 15,
                  fontFamily: "JetBrains Mono, Fira Code, monospace",
                  fontLigatures: true,

                  minimap: {
                    enabled: false,
                  },

                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  wordWrapColumn: 120,

                  tabSize: 2,
                  insertSpaces: true,

                  lineNumbers: "on",
                  lineNumbersMinChars: 3,
                  glyphMargin: false,

                  folding: true,
                  foldingHighlight: true,

                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,

                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  acceptSuggestionOnEnter: "on",

                  bracketPairColorization: {
                    enabled: true,
                  },

                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  autoIndent: "full",
                  formatOnPaste: true,
                  formatOnType: true,

                  padding: {
                    top: 16,
                    bottom: 16,
                  },

                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },

                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                }}
              />
            </div>

            <div className="flex h-full flex-col bg-[#fbfbfd]">
              {/* Testcase Tabs */}
              <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3">
                {visibleTestCases.length === 0 ? (
                  <span className="text-sm text-gray-500">
                    No visible test cases
                  </span>
                ) : (
                  visibleTestCases.map((_, index) => (
                    <button
                      key={`testcase-${index}`}
                      type="button"
                      onClick={() => setSelectedTestCase(index)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        selectedTestCase === index
                          ? "bg-gray-950 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Case {index + 1}
                    </button>
                  ))
                )}
              </div>

              {/* Testcase Display */}
              <div className="flex-1 overflow-auto p-5">
                {activeTestCase ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                          Input
                        </p>
                      </div>
                      <pre className="overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-sm text-gray-800">
                        {activeTestCase.input}
                      </pre>
                    </div>

                    <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                          Expected Output
                        </p>
                      </div>
                      <pre className="overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-sm text-gray-800">
                        {activeTestCase.output}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    Sample tests will appear here when the selected problem includes them.
                  </div>
                )}
              </div>

              {/* Run Result (NOW ALWAYS VISIBLE) */}
              <div className="border-t border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Run Result
                    </p>
                    {runResult?.summary && (
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          runResult.success
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {runResult.summary}
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-[180px] overflow-auto px-4 py-4">
                  {!runResult && (
                    <p className="text-sm text-gray-500">
                      Run code to evaluate the visible sample cases.
                    </p>
                  )}

                  {runResult?.results?.map((result, index) => (
                    <div
                      key={`run-result-${index}`}
                      className="mb-3 rounded-2xl border border-gray-200 bg-[#fafafc] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          Case {index + 1}
                        </p>
                        <span
                          className={`text-xs font-semibold ${
                            result.passed ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {result.passed ? "Passed" : "Failed"}
                        </span>
                      </div>

                      <pre className="mt-2 text-sm text-gray-700">
                        {result.actualOutput || "(no output)"}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ArenaClient;
