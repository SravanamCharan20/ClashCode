"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ArenaEditorWorkspace from "./ArenaEditorWorkspace";
import ArenaHeader from "./ArenaHeader";
import ArenaProblemWorkspace from "./ArenaProblemWorkspace";
import { useArenaContest } from "./useArenaContest";

const ArenaClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const initialRoomCode = searchParams.get("roomCode") || "";
  const [contestPanelOpen, setContestPanelOpen] = useState(false);
  const [contestPanelTab, setContestPanelTab] = useState("leaderboard");
  const [leftPaneWidth, setLeftPaneWidth] = useState(42);
  const layoutRef = useRef(null);

  const arena = useArenaContest({ roomId, initialRoomCode });

  if (arena.loading || arena.userLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] px-6 py-24 text-sm text-gray-600">
        Loading arena...
      </div>
    );
  }

  const handleMainSplitDragStart = (event) => {
    event.preventDefault();

    const handleMouseMove = (moveEvent) => {
      if (!layoutRef.current) {
        return;
      }

      const bounds = layoutRef.current.getBoundingClientRect();
      const rawWidth = ((moveEvent.clientX - bounds.left) / bounds.width) * 100;
      const clampedWidth = Math.min(60, Math.max(30, rawWidth));
      setLeftPaneWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900">
      <ArenaHeader
        roomCode={arena.roomCode}
        remainingSeconds={arena.remainingSeconds}
        isAdmin={arena.isAdmin}
        terminating={arena.terminating}
        completing={arena.completing}
        roomStatus={arena.roomStatus}
        leaderboard={arena.leaderboard}
        participants={arena.participants}
        submissionHistory={arena.submissionHistory}
        contestPanelOpen={contestPanelOpen}
        contestPanelTab={contestPanelTab}
        setContestPanelOpen={setContestPanelOpen}
        setContestPanelTab={setContestPanelTab}
        onExit={() => router.push("/dashboard")}
        onTerminate={arena.handleTerminateRoom}
        onComplete={arena.handleCompleteRoom}
      />

      <div
        ref={layoutRef}
        className="mx-auto grid h-[calc(100vh-110px)] w-full max-w-[1650px] grid-cols-1 gap-3 px-3 py-3 lg:px-4 lg:py-4"
      >
        <div
          className="hidden h-full gap-2 lg:grid"
          style={{
            gridTemplateColumns: `minmax(0, ${leftPaneWidth}%) 8px minmax(0, ${100 - leftPaneWidth}%)`,
          }}
        >
          <ArenaProblemWorkspace
            openDropdown={arena.openDropdown}
            setOpenDropdown={arena.setOpenDropdown}
            contestProblems={arena.contestProblems}
            selectedProblem={arena.selectedProblem}
            error={arena.error}
            isContestCompleted={arena.isContestCompleted}
            roomStatus={arena.roomStatus}
            onSelectProblem={arena.handleProblemSelect}
          />

          <button
            type="button"
            aria-label="Resize panels"
            onMouseDown={handleMainSplitDragStart}
            className="group relative h-full cursor-col-resize rounded-md bg-[#eef1f7] hover:bg-[#e5e9f3]"
          >
            <span className="mx-auto block h-full w-[2px] rounded-full bg-gray-400 transition group-hover:bg-gray-600" />
            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 opacity-0 transition group-hover:opacity-100">
              Drag
            </span>
          </button>

          <ArenaEditorWorkspace
            selectedLanguage={arena.selectedLanguage}
            onLanguageChange={arena.handleLanguageChange}
            isContestCompleted={arena.isContestCompleted}
            runLoading={arena.runLoading}
            onRunCode={arena.handleRunCode}
            handleSubmitCode={arena.handleSubmitCode}
            editorCode={arena.editorCode}
            onEditorChange={arena.handleEditorChange}
            visibleTestCases={arena.visibleTestCases}
            selectedTestCase={arena.selectedTestCase}
            setSelectedTestCase={arena.setSelectedTestCase}
            activeTestCase={arena.activeTestCase}
            runResult={arena.runResult}
          />
        </div>

        <div className="grid h-full grid-cols-1 gap-3 lg:hidden">
          <ArenaProblemWorkspace
            openDropdown={arena.openDropdown}
            setOpenDropdown={arena.setOpenDropdown}
            contestProblems={arena.contestProblems}
            selectedProblem={arena.selectedProblem}
            error={arena.error}
            isContestCompleted={arena.isContestCompleted}
            roomStatus={arena.roomStatus}
            onSelectProblem={arena.handleProblemSelect}
          />
          <ArenaEditorWorkspace
            selectedLanguage={arena.selectedLanguage}
            onLanguageChange={arena.handleLanguageChange}
            isContestCompleted={arena.isContestCompleted}
            runLoading={arena.runLoading}
            onRunCode={arena.handleRunCode}
            handleSubmitCode={arena.handleSubmitCode}
            editorCode={arena.editorCode}
            onEditorChange={arena.handleEditorChange}
            visibleTestCases={arena.visibleTestCases}
            selectedTestCase={arena.selectedTestCase}
            setSelectedTestCase={arena.setSelectedTestCase}
            activeTestCase={arena.activeTestCase}
            runResult={arena.runResult}
          />
        </div>
      </div>
    </div>
  );
};

export default ArenaClient;
