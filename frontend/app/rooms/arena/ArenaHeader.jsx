"use client";

import { formatRemainingTime } from "./arenaUtils";

const ArenaHeader = ({
  roomCode,
  remainingSeconds,
  isAdmin,
  terminating,
  roomStatus,
  leaderboard,
  participants,
  contestPanelOpen,
  contestPanelTab,
  setContestPanelOpen,
  setContestPanelTab,
  onExit,
  onTerminate,
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

          <div className="order-first flex items-center justify-center rounded-xl border border-gray-700 bg-[#0f172a] px-4 py-2 text-white shadow-sm lg:order-none">
            <p className="text-xl font-semibold tracking-[0.08em]">
              {formatRemainingTime(remainingSeconds)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => setContestPanelOpen((prev) => !prev)}
              className="rounded-full border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {contestPanelOpen ? "Hide Contest Panel" : "Show Contest Panel"}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-full border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Exit
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={onTerminate}
                disabled={terminating || roomStatus === "terminated"}
                className="rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {roomStatus === "terminated"
                  ? "Terminated"
                  : terminating
                    ? "Terminating..."
                    : "Terminate"}
              </button>
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
            <div className="fixed right-4 top-[76px] z-50 w-full max-w-[380px] rounded-2xl border border-gray-200 bg-gray-50 p-3 shadow-2xl">
              <div className="flex flex-wrap items-center gap-2">
                {contestTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setContestPanelTab(tab.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      contestPanelTab === tab.id
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 max-h-[260px] overflow-y-auto rounded-xl border border-gray-200 bg-white">
                {contestPanelTab === "leaderboard" && (
                  <div className="divide-y divide-gray-100">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((entry) => (
                        <div
                          key={`${entry.user || entry.username}-${entry.rank}`}
                          className="flex items-center justify-between px-4 py-2 text-sm"
                        >
                          <span className="text-gray-700">
                            {entry.rank}. {entry.username}
                          </span>
                          <span className="font-semibold text-gray-900">{entry.score}</span>
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
                          className="px-4 py-2 text-sm text-gray-700"
                        >
                          {index + 1}. {participant.username || "Participant"}
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-gray-500">No participants found.</p>
                    )}
                  </div>
                )}

                {contestPanelTab === "submissions" && (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    Submission history opens here during live integration.
                  </p>
                )}

                {contestPanelTab === "activity" && (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    Room activity will appear here without interrupting coding flow.
                  </p>
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
