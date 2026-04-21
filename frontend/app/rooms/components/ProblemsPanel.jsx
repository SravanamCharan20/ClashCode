"use client";

const ProblemsPanel = ({
  problems,
  selectedProblemId,
  onSelectProblem,
  title = "Problems",
  subtitle = "Contest set",
}) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl">
      <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
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
                    ? "border-black bg-gray-100"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                } ${onSelectProblem ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {index + 1}. {problem.title}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-gray-500">
                      {(problem.difficulty || "easy").toUpperCase()}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
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
