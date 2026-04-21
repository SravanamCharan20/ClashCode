"use client";

const ProblemsPanel = ({
  problems,
  selectedProblemId,
  onSelectProblem,
  title = "Problems",
  subtitle = "Contest set",
}) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        {subtitle}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-gray-900">{title}</h2>

      <div className="mt-5 space-y-3">
        {problems.length === 0 ? (
          <p className="text-sm text-gray-500">No problems selected yet.</p>
        ) : (
          problems.map((entry, index) => {
            const problem = entry.problem || entry;
            const isActive = selectedProblemId === problem._id;

            return (
              <button
                key={problem._id || problem.slug || index}
                type="button"
                onClick={() => onSelectProblem?.(problem._id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  isActive
                    ? "border-gray-900 bg-gray-100"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                } ${onSelectProblem ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {index + 1}. {problem.title}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        (problem.difficulty || "easy").toLowerCase() === "hard"
                          ? "bg-red-100 text-red-700"
                          : (problem.difficulty || "easy").toLowerCase() === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {problem.difficulty || "easy"}
                    </span>
                  </div>

                  <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                    {problem.points || 100} pts
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProblemsPanel;
