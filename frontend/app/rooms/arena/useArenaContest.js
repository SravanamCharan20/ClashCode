"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../auth/userContext";
import socket from "../../../sockets/socket.js";
import {
  API_URL,
  buildEmptyRunResult,
  getDraftKey,
  scorePalette,
} from "./arenaUtils";

export const useArenaContest = ({ roomId, initialRoomCode }) => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

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

  // Listen for submission results on personal socket room
  useEffect(() => {
    if (!user?._id) return;

    const handleSubmissionResult = (data) => {
      console.log("🔥 Submission Result:", data);
      if (!data?.roomId || data.roomId !== activeRoomId) {
        return;
      }
      if (data.problemId && data.problemId !== selectedProblemId) {
        return;
      }

      const normalizedResults = (data.results || []).map((result) => ({
        input: result.input || "",
        expectedOutput: result.expectedOutput || result.expected || "",
        actualOutput:
          result.actualOutput ||
          result.output?.stdout ||
          result.output ||
          "",
        passed:
          typeof result.passed === "boolean"
            ? result.passed
            : result.verdict === "AC",
        error: result.error || result.output?.stderr || "",
        errorType: result.errorType || result.output?.errorType || null,
        verdict: result.verdict || null,
      }));
      const passedCount =
        typeof data.passedCount === "number"
          ? data.passedCount
          : normalizedResults.filter((r) => r.passed).length;
      const totalCount =
        typeof data.totalCount === "number"
          ? data.totalCount
          : normalizedResults.length;

      setRunResult({
        success: data.success ?? (data.verdict ? data.verdict === "AC" : false),
        summary:
          data.summary ||
          (data.verdict
            ? data.verdict === "AC"
              ? "Submission Accepted"
              : `Submission ${data.verdict}`
            : "Submission Completed"),
        passedCount,
        totalCount,
        results: normalizedResults,
      });
    };

    socket.on("submission-result", handleSubmissionResult);

    return () => {
      socket.off("submission-result", handleSubmissionResult);
    };
  }, [activeRoomId, selectedProblemId, user?._id]);

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

  const leaderboard = useMemo(
    () =>
      participants.map((participant, index) => ({
        ...participant,
        rank: index + 1,
        solved: Math.max(0, Math.min(index, contestProblems.length)),
        score: scorePalette[index] || 60,
        isCurrentUser: participant.user?.toString() === user?._id?.toString(),
      })),
    [contestProblems.length, participants, user?._id],
  );

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

  const handleEditorChange = (value) => {
    setCodeDrafts((prev) => ({
      ...prev,
      [getDraftKey(selectedProblem?._id, selectedLanguage)]: value || "",
    }));
    setEditorCode(value || "");
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
      setRunResult(
        buildEmptyRunResult("Select a valid room problem before running code"),
      );
      return;
    }

    if (!editorCode.trim()) {
      setRunResult(buildEmptyRunResult("Code cannot be empty"));
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
        setRunResult(buildEmptyRunResult(data.message || "Unable to run code"));
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
      setRunResult(
        buildEmptyRunResult("Something went wrong while running code"),
      );
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!activeRoomId || !selectedProblem?._id) return;

    if (!editorCode.trim()) {
      setRunResult(buildEmptyRunResult("Code cannot be empty"));
      return;
    }

    try {
      setRunLoading(true);
      setRunResult({
        success: true,
        summary: "Submitting...",
        results: [],
      });

      const res = await fetch(`${API_URL}/exec/submit-code`, {
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
        setRunResult(buildEmptyRunResult(data.message || "Submission failed"));
        return;
      }

      // IMPORTANT:
      // Do NOT set final result here
      // Worker + socket will handle it
    } catch {
      setRunResult(buildEmptyRunResult("Something went wrong"));
    } finally {
      setRunLoading(false);
    }
  };

  return {
    userLoading,
    loading,
    error,
    roomCode,
    participants,
    contestProblems,
    duration,
    roomStatus,
    selectedProblem,
    selectedLanguage,
    editorCode,
    visibleTestCases,
    activeTestCase,
    selectedTestCase,
    openDropdown,
    leaderboard,
    isAdmin,
    terminating,
    isContestCompleted,
    contestProgress,
    remainingSeconds,
    runResult,
    runLoading,
    handleProblemSelect,
    handleLanguageChange,
    handleEditorChange,
    handleTerminateRoom,
    handleRunCode,
    handleSubmitCode,
    setOpenDropdown,
    setSelectedTestCase,
  };
};
