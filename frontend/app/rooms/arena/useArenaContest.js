"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../auth/userContext";
import socket from "../../../sockets/socket.js";
import {
  API_URL,
  buildEmptyRunResult,
  getDraftKey,
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
  const [completing, setCompleting] = useState(false);
  const [now, setNow] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const hasRedirectedRef = useRef(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);

  const applyLeaderboardSnapshot = (leaderboardEntries) => {
    if (!Array.isArray(leaderboardEntries) || leaderboardEntries.length === 0) {
      return;
    }

    setParticipants((prev) => {
      const prevByUser = new Map(
        (prev || []).map((participant) => [
          participant.user?.toString() || "",
          participant,
        ]),
      );

      return leaderboardEntries.map((entry) => {
        const existing = prevByUser.get(entry.user) || {};
        return {
          ...existing,
          user: entry.user,
          username: entry.username || existing.username || "Participant",
          score: entry.score || 0,
          solvedProblems: entry.solvedProblems || [],
          lastSolvedAt: entry.lastSolvedAt || null,
        };
      });
    });
  };

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

      hasRedirectedRef.current = true;
      router.push(
        `/rooms/arenaResults?roomId=${activeRoomId}&roomCode=${encodeURIComponent(
          payload.roomCode || roomCode || "",
        )}&notice=room-terminated`,
      );
    };

    socket.on("room-terminated", handleRoomTerminated);

    return () => {
      socket.off("room-terminated", handleRoomTerminated);
    };
  }, [activeRoomId, roomCode, router]);

  useEffect(() => {
    if (!user?._id) return;

    const handleRoomTimerUpdate = (payload) => {
      if (!payload?.roomId || payload.roomId !== activeRoomId) {
        return;
      }
      if (typeof payload.remainingSeconds === "number") {
        setInitialRemainingSeconds(payload.remainingSeconds);
        setNow(Date.now());
      }
      if (payload.endsAt) {
        setEndsAt(payload.endsAt);
      }
      if (payload.status) {
        setRoomStatus(payload.status);
      }
    };

    const handleRoomCompleted = (payload) => {
      if (!payload?.roomId || payload.roomId !== activeRoomId) {
        return;
      }
      setRoomStatus("completed");
      setInitialRemainingSeconds(0);
      setNow(Date.now());
    };

    socket.on("room-timer-update", handleRoomTimerUpdate);
    socket.on("room-completed", handleRoomCompleted);

    return () => {
      socket.off("room-timer-update", handleRoomTimerUpdate);
      socket.off("room-completed", handleRoomCompleted);
    };
  }, [activeRoomId, user?._id]);

  useEffect(() => {
    if (!activeRoomId || !user?._id) {
      return undefined;
    }

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/room/${activeRoomId}/leaderboard`, {
          credentials: "include",
        });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        applyLeaderboardSnapshot(data.leaderboard);
      } catch {
        // Keep UI functional even if this one request fails.
      }
    };

    fetchLeaderboard();
    return undefined;
  }, [activeRoomId, user?._id]);

  useEffect(() => {
    if (!activeRoomId || !user?._id) {
      return undefined;
    }

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${API_URL}/room/${activeRoomId}/submissions`, {
          credentials: "include",
        });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data.submissions)) {
          return;
        }
        setSubmissionHistory(data.submissions);
      } catch {
        // best effort fetch
      }
    };

    fetchSubmissions();
    return undefined;
  }, [activeRoomId, user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const handleLeaderboardUpdate = (data) => {
      if (!data?.roomId || data.roomId !== activeRoomId) {
        return;
      }
      applyLeaderboardSnapshot(data.leaderboard);
    };

    socket.on("leaderboard-update", handleLeaderboardUpdate);

    return () => {
      socket.off("leaderboard-update", handleLeaderboardUpdate);
    };
  }, [activeRoomId, user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const handleSubmissionUpdate = (payload) => {
      if (!payload?.roomId || payload.roomId !== activeRoomId) {
        return;
      }
      const submission = payload.submission;
      if (!submission?.id) {
        return;
      }

      setSubmissionHistory((prev) => {
        if ((prev || []).some((item) => item.id === submission.id)) {
          return prev;
        }
        return [submission, ...(prev || [])].slice(0, 100);
      });
    };

    socket.on("submission-update", handleSubmissionUpdate);
    return () => {
      socket.off("submission-update", handleSubmissionUpdate);
    };
  }, [activeRoomId, user?._id]);

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
    () => {
      const sorted = [...participants].sort((a, b) => {
        if ((b.score || 0) !== (a.score || 0)) {
          return (b.score || 0) - (a.score || 0);
        }

        const aTime = a.lastSolvedAt
          ? new Date(a.lastSolvedAt).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bTime = b.lastSolvedAt
          ? new Date(b.lastSolvedAt).getTime()
          : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });

      return sorted.map((participant, index) => ({
        ...participant,
        rank: index + 1,
        solved: participant.solvedProblems?.length || 0,
        score: participant.score || 0,
        isCurrentUser: participant.user?.toString() === user?._id?.toString(),
      }));
    },
    [participants, user?._id],
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

  useEffect(() => {
    if (!activeRoomId || hasRedirectedRef.current) {
      return;
    }

    if (roomStatus === "terminated") {
      hasRedirectedRef.current = true;
      router.push(
        `/rooms/arenaResults?roomId=${activeRoomId}&roomCode=${encodeURIComponent(
          roomCode || "",
        )}&notice=room-terminated`,
      );
      return;
    }

    if (roomStatus === "completed" || remainingSeconds === 0) {
      hasRedirectedRef.current = true;
      router.push(
        `/rooms/arenaResults?roomId=${activeRoomId}&roomCode=${encodeURIComponent(
          roomCode || "",
        )}&notice=room-completed`,
      );
    }
  }, [activeRoomId, remainingSeconds, roomCode, roomStatus, router]);

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

      router.push("/");
    } catch {
      setError("Something went wrong while terminating the room");
      setTerminating(false);
    }
  };

  const handleCompleteRoom = async () => {
    if (!activeRoomId || !isAdmin || completing) {
      return;
    }

    const confirmed = window.confirm(
      "Complete this room now? All users will be moved to results.",
    );
    if (!confirmed) {
      return;
    }

    try {
      setCompleting(true);
      const res = await fetch(`${API_URL}/room/${activeRoomId}/complete`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to complete room");
        setCompleting(false);
      }
    } catch {
      setError("Something went wrong while completing the room");
      setCompleting(false);
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
    completing,
    isContestCompleted,
    contestProgress,
    remainingSeconds,
    runResult,
    runLoading,
    submissionHistory,
    handleProblemSelect,
    handleLanguageChange,
    handleEditorChange,
    handleTerminateRoom,
    handleCompleteRoom,
    handleRunCode,
    handleSubmitCode,
    setOpenDropdown,
    setSelectedTestCase,
  };
};
