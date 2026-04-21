"use client";

import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";

const ArenaEditorWorkspace = ({
  selectedLanguage,
  onLanguageChange,
  isContestCompleted,
  runLoading,
  onRunCode,
  editorCode,
  onEditorChange,
  visibleTestCases,
  selectedTestCase,
  setSelectedTestCase,
  activeTestCase,
  runResult,
}) => {
  const [bottomPanelTab, setBottomPanelTab] = useState("testcase");
  const [editorHeight, setEditorHeight] = useState(66);
  const workspaceRef = useRef(null);

  const handleRunClick = async () => {
    setBottomPanelTab("result");
    await onRunCode();
  };

  const handleEditorSplitDragStart = (event) => {
    event.preventDefault();

    const handleMouseMove = (moveEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const bounds = workspaceRef.current.getBoundingClientRect();
      const rawHeight = ((moveEvent.clientY - bounds.top) / bounds.height) * 100;
      const clampedHeight = Math.min(82, Math.max(45, rawHeight));
      setEditorHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <section className="min-h-0 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 px-4 py-3 lg:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
              Code Editor
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Write stdin/stdout contest code and iterate quickly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="rounded-full border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-700 outline-none transition focus:border-black"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>

            <button
              type="button"
              disabled={isContestCompleted || runLoading}
              onClick={handleRunClick}
              className="rounded-full border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {runLoading ? "Running..." : "Run Code"}
            </button>
            <button
              type="button"
              disabled={isContestCompleted}
              className="rounded-full bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <div
        ref={workspaceRef}
        className="grid h-[calc(100%-81px)]"
        style={{
          gridTemplateRows: `minmax(0, ${editorHeight}%) 8px minmax(0, ${100 - editorHeight}%)`,
        }}
      >
        <div className="h-full border-b border-black/5 bg-[#0a0f1a]">
          <Editor
            height="100%"
            language={selectedLanguage === "javascript" ? "javascript" : "python"}
            value={editorCode}
            onChange={onEditorChange}
            theme="vs-dark"
            options={{
              fontSize: 15,
              fontFamily: "JetBrains Mono, Fira Code, monospace",
              fontLigatures: true,
              minimap: { enabled: false },
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
              bracketPairColorization: { enabled: true },
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

        <button
          type="button"
          aria-label="Resize editor and results"
          onMouseDown={handleEditorSplitDragStart}
          className="group relative cursor-row-resize bg-[#eef1f7] hover:bg-[#e5e9f3]"
        >
          <span className="mx-auto mt-0.5 block h-[2px] w-full max-w-[120px] rounded-full bg-gray-400 transition group-hover:bg-gray-600" />
          <span className="pointer-events-none absolute inset-x-0 top-1 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 opacity-0 transition group-hover:opacity-100">
            Drag to resize
          </span>
        </button>

        <div className="flex h-full min-h-0 flex-col border-t border-black/5 bg-[#f8f9fb]">
          <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBottomPanelTab("testcase")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  bottomPanelTab === "testcase"
                    ? "bg-gray-950 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Testcase
              </button>
              <button
                type="button"
                onClick={() => setBottomPanelTab("result")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  bottomPanelTab === "result"
                    ? "bg-gray-950 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Test Result
              </button>
            </div>

            {bottomPanelTab === "testcase" && visibleTestCases.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto">
                {visibleTestCases.map((_, index) => (
                  <button
                    key={`testcase-${index}`}
                    type="button"
                    onClick={() => setSelectedTestCase(index)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      selectedTestCase === index
                        ? "bg-white text-gray-900 ring-1 ring-gray-300"
                        : "bg-white/70 text-gray-700 hover:bg-white"
                    }`}
                  >
                    Case {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {bottomPanelTab === "testcase" && (
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto px-4 py-3 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Input
                  </p>
                </div>
                <pre className="max-h-[220px] overflow-x-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-sm text-gray-800">
                  {activeTestCase?.input || "No visible test case selected."}
                </pre>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Expected Output
                  </p>
                </div>
                <pre className="max-h-[220px] overflow-x-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-sm text-gray-800">
                  {activeTestCase?.output || "No expected output available."}
                </pre>
              </div>
            </div>
          )}

          {bottomPanelTab === "result" && (
            <div className="min-h-0 flex-1 overflow-y-auto border-t border-black/5 bg-white px-4 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
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

              {!runResult && (
                <p className="text-sm text-gray-500">
                  Run code to evaluate the visible sample cases.
                </p>
              )}

              {runResult && runResult.results?.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-[#fafafc] p-4">
                  <p className="text-sm text-gray-700">{runResult.summary}</p>
                </div>
              )}

              <div className="space-y-3">
                {runResult?.results?.map((result, index) => (
                  <div
                    key={`run-result-${index}`}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">Case {index + 1}</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          result.passed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {result.passed ? "Passed" : "Failed"}
                      </span>
                    </div>

                    {result.errorType && (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
                        {result.errorType}
                      </p>
                    )}

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                          Expected Output
                        </p>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-white px-3 py-3 font-mono text-sm text-gray-800">
                          {result.expectedOutput || "(empty)"}
                        </pre>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                          Your Output
                        </p>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-white px-3 py-3 font-mono text-sm text-gray-800">
                          {result.actualOutput || "(no output)"}
                        </pre>
                      </div>
                    </div>

                    {result.error && (
                      <div className="mt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">
                          Error From Runner
                        </p>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-red-50 px-3 py-3 font-mono text-sm text-red-700">
                          {result.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ArenaEditorWorkspace;
