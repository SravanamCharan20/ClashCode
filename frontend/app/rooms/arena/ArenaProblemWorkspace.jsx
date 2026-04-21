"use client";

const ArenaProblemWorkspace = ({
  openDropdown,
  setOpenDropdown,
  contestProblems,
  selectedProblem,
  error,
  isContestCompleted,
  roomStatus,
  onSelectProblem,
}) => {
  return (
    <section className="min-h-0 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 lg:px-5">
        <div className="flex items-center gap-2">
          <div className="relative dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === "problems" ? null : "problems");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
            >
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/80">
                Switch
              </span>
              <span>Problems</span>
              <span className="text-[11px] text-white/80">
                {openDropdown === "problems" ? "▲" : "▼"}
              </span>
            </button>

            {openDropdown === "problems" && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                {contestProblems.map((entry, index) => (
                  <div
                    key={entry.problem._id}
                    onClick={() => {
                      onSelectProblem(entry.problem._id);
                      setOpenDropdown(null);
                    }}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    {String.fromCharCode(65 + index)}. {entry.problem.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">
            Problem
          </p>
          <h2 className="truncate text-base font-semibold text-gray-950 lg:text-lg">
            {selectedProblem?.title || "No problem selected"}
          </h2>
        </div>
      </div>

      <div className="h-[calc(100%-72px)] overflow-y-auto px-4 py-4 lg:px-5 lg:py-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isContestCompleted && !error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {roomStatus === "terminated"
              ? "This room was terminated by the admin. The workspace stays visible for review, but code actions are disabled."
              : "This contest has ended. The workspace stays visible for review, but code actions are disabled."}
          </div>
        )}

        {selectedProblem ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-[#fafafa] px-4 py-4 text-sm leading-7 text-gray-700">
              {selectedProblem.description}
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Input Format
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {selectedProblem.inputFormat || "Read input from standard input."}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
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
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      Example {index + 1}
                    </p>
                    <div className="mt-4 grid gap-4">
                      <div className="rounded-xl bg-[#f5f5f7] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                          Input
                        </p>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-800">
                          {example.input}
                        </pre>
                      </div>
                      <div className="rounded-xl bg-[#f5f5f7] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                          Output
                        </p>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-800">
                          {example.output}
                        </pre>
                      </div>
                      {example.explanation && (
                        <div className="rounded-xl bg-[#f5f5f7] p-4">
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
              <div className="rounded-xl border border-gray-200 bg-white p-4">
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

            <details className="rounded-xl border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                Notes & Discussion
              </summary>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Use this space for approach notes, edge-case reminders, or contest
                discussion context when enabled for the room.
              </p>
            </details>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No contest problem available.</p>
        )}
      </div>
    </section>
  );
};

export default ArenaProblemWorkspace;
