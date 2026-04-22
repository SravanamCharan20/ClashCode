"use client";

import { formatRemainingTime } from "./arenaUtils";

const ArenaHeader = ({
  roomCode,
  remainingSeconds,
  isAdmin,
  terminating,
  completing,
  roomStatus,
  leaderboard,
  participants,
  submissionHistory,
  contestPanelOpen,
  contestPanelTab,
  setContestPanelOpen,
  setContestPanelTab,
  onExit,
  onTerminate,
  onComplete,
}) => {
  const contestTabs = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "participants", label: "Participants" },
    { id: "submissions", label: "Submissions" },
    { id: "activity", label: "Activity" },
  ];

  const statusTone =
    roomStatus === "terminated"
      ? "bg-red-50 text-red-700 border-red-200"
      : roomStatus === "completed" || remainingSeconds === 0
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <header className="relative border-b border-black/5 bg-white">
      <div className="mx-auto w-full max-w-[1650px] px-3 py-3 lg:px-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500">
              Contest Arena
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-gray-950">
                {roomCode ? `Room ${roomCode}` : "Active Contest"}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${statusTone}`}
              >
                {roomStatus || "live"}
              </span>
            </div>
          </div>

          <div className="order-first flex flex-col items-center gap-2 lg:order-none">
            <div className="flex items-center justify-center rounded-xl border border-gray-700 bg-[#0f172a] px-4 py-2 text-white shadow-sm">
              <p className="text-xl font-semibold tracking-[0.08em]">
                {formatRemainingTime(remainingSeconds)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setContestPanelOpen((prev) => !prev)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                contestPanelOpen
                  ? "border-indigo-300 bg-indigo-100 text-indigo-700"
                  : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
            >
              {contestPanelOpen ? "Close Contest Panel" : "Open Contest Panel"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
            <button
              type="button"
              onClick={onExit}
              className="rounded-full border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Exit
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={onComplete}
                  disabled={
                    completing ||
                    roomStatus === "completed" ||
                    roomStatus === "terminated"
                  }
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {roomStatus === "completed"
                    ? "Completed"
                    : completing
                      ? "Completing..."
                      : "Complete Contest"}
                </button>
                <button
                  type="button"
                  onClick={onTerminate}
                  disabled={
                    terminating ||
                    roomStatus === "terminated" ||
                    roomStatus === "completed"
                  }
                  className="rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {roomStatus === "terminated"
                    ? "Terminated"
                    : terminating
                      ? "Terminating..."
                      : "Terminate"}
                </button>
              </>
            )}
          </div>
        </div>

        {contestPanelOpen && (
          <>
            <button
              type="button"
              aria-label="Close contest panel"
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              onClick={() => setContestPanelOpen(false)}
            />
            <div className="fixed left-1/2 top-[92px] z-50 w-[min(94vw,900px)] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-700">
                  Contest Panel
                </p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Live updates
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-2">
                {contestTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setContestPanelTab(tab.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      contestPanelTab === tab.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-transparent bg-white text-gray-700 hover:border-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-white">
                {contestPanelTab === "leaderboard" && (
                  <div className="divide-y divide-gray-100">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((entry, index) => (
                        <div
                          key={`${entry.user || entry.username}-${entry.rank}`}
                          className={`grid grid-cols-[56px_minmax(0,1fr)_90px] items-center gap-3 px-4 py-3 text-sm ${
                            index < 3 ? "bg-amber-50/40" : ""
                          }`}
                        >
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                            #{entry.rank}
                          </span>
                          <span className="truncate font-medium text-gray-800">
                            {entry.username}
                          </span>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{entry.score} pts</p>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">
                              {entry.solved || 0} solved
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-gray-500">
                        No leaderboard data yet.
                      </p>
                    )}
                  </div>
                )}

                {contestPanelTab === "participants" && (
                  <div className="divide-y divide-gray-100">
                    {participants.length > 0 ? (
                      participants.map((participant, index) => (
                        <div
                          key={`${participant.user || participant.username}-${index}`}
                          className="grid grid-cols-[56px_minmax(0,1fr)_110px] items-center gap-3 px-4 py-3 text-sm text-gray-700"
                        >
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                            P{index + 1}
                          </span>
                          <span className="truncate font-medium text-gray-800">
                            {participant.username || "Participant"}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                            Active
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-gray-500">No participants found.</p>
                    )}
                  </div>
                )}

                {contestPanelTab === "submissions" && (
                  <div className="space-y-3 px-4 py-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">Submission stream</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Latest accepted, failed, and pending submissions will appear here.
                      </p>
                    </div>
                    {submissionHistory?.length > 0 ? (
                      <div className="space-y-2">
                        {submissionHistory.map((submission) => (
                          <div
                            key={submission.id}
                            className="grid grid-cols-[minmax(0,1fr)_94px_86px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-800">
                                {submission.username || "Participant"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {submission.language || "code"} •{" "}
                                {new Date(submission.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <p className="truncate text-xs text-gray-500">
                              {submission.problemId?.slice(-6) || "problem"}
                            </p>
                            <span
                              className={`rounded-full px-2 py-1 text-center text-[11px] font-semibold ${
                                submission.verdict === "AC"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {submission.verdict}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No submissions available yet for this room.
                      </p>
                    )}
                  </div>
                )}

                {contestPanelTab === "activity" && (
                  <div className="space-y-3 px-4 py-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">Contest activity log</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Join/leave events, announcements, and important room updates.
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">No activity events yet.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default ArenaHeader;
