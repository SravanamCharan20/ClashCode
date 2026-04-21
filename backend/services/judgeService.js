import { executeCode } from "./executionService.js";

const normalize = (val) =>
  (val || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .join("\n");

export const evaluateSubmission = async ({
  code,
  language,
  testCases,
}) => {
  const results = [];

  for (const testCase of testCases) {
    const execution = await executeCode({
      code,
      language,
      input: testCase.input,
    });

    const actual = normalize(execution.stdout);
    const expected = normalize(testCase.output);

    const passed = execution.success && actual === expected;

    results.push({
      input: testCase.input,
      expectedOutput: testCase.output,
      actualOutput: execution.stdout || "",
      passed,
      error: execution.success ? "" : execution.stderr,
      errorType: execution.success ? null : execution.errorType,
    });

    if (!execution.success) break;
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = testCases.length;
  const failed = results.find((r) => r.error);

  return {
    success: passedCount === totalCount,
    summary:
      failed?.errorType === "timeout"
        ? "Execution timed out"
        : failed
        ? "Runtime error"
        : `${passedCount}/${totalCount} sample cases passed`,
    passedCount,
    totalCount,
    results,
  };
};