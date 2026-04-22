export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9999";

export const formatRemainingTime = (remainingSeconds) => {
  if (typeof remainingSeconds !== "number") {
    return "--:--";
  }

  const safeSeconds = Math.max(0, remainingSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
};

export const getDraftKey = (problemId, language) =>
  `${problemId || "unknown"}:${language}`;

export const buildEmptyRunResult = (summary) => ({
  success: false,
  summary,
  results: [],
});
