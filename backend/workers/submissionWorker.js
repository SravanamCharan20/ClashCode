import { Worker } from "bullmq";
import IORedis from "ioredis";
import { executeCode } from "../services/executionService.js";
import { judge } from "../services/judgeService.js";
import { Submission } from "../models/Submission.js";
import connectDB from "../config/db.js";
import { publishSubmission } from "../config/redisPublisher.js";

await connectDB();
console.log("✅ Worker DB connected");
console.log("🔥 Worker started...");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "submission-queue",
  async (job) => {
    const { code, language, problemId, userId } = job.data;
    console.log("Processing job:", job.id);

    const testCases = [
      { input: "2 3", expected: "5" },
      { input: "10 20", expected: "30" },
    ];

    let results = [];
    for (let test of testCases) {
      const output = await executeCode({
        code,
        language,
        input: test.input,
      });
      // Safety check for execution failure
      if (!output.success) {
        results.push({
          input: test.input,
          expected: test.expected,
          output,
          verdict: output.errorType === "timeout" ? "TLE" : "RE",
        });
        break;
      }
      const verdict = judge(output.stdout, test.expected);

      results.push({
        input: test.input,
        expected: test.expected,
        output,
        verdict,
      });

      if (verdict !== "AC") break; // stop early like LeetCode
    }
    return {
      userId,
      problemId,
      results,
    };
  },
  { connection },
);

worker.on("completed", async (job, result) => {
  console.log("Job completed:", job.id);

  try {
    const finalVerdict = result.results.every((r) => r.verdict === "AC")
      ? "AC"
      : result.results.find((r) => r.verdict !== "AC")?.verdict || "RE";
    const normalizedResults = result.results.map((r) => ({
      input: r.input,
      expectedOutput: r.expected,
      actualOutput: r.output?.stdout || "",
      passed: r.verdict === "AC",
      error: r.output?.success ? "" : r.output?.stderr || "",
      errorType: r.output?.success ? null : r.output?.errorType || null,
      verdict: r.verdict,
    }));
    const passedCount = normalizedResults.filter((r) => r.passed).length;

    const saved = await Submission.create({
      userId: result.userId,
      problemId: result.problemId,
      roomId: job.data.roomId,
      code: job.data.code,
      language: job.data.language,
      verdict: finalVerdict,
      testCases: result.results.map((r) => ({
        input: r.input,
        expected: r.expected,
        output: r.output.stdout || "",
        verdict: r.verdict,
      })),
    });

    console.log("Saved Submission:", saved._id);

    await publishSubmission({
      userId: result.userId,
      roomId: job.data.roomId,
      problemId: result.problemId,
      verdict: finalVerdict,
      summary:
        finalVerdict === "AC"
          ? "Submission Accepted"
          : `Submission ${finalVerdict}`,
      passedCount,
      totalCount: normalizedResults.length,
      success: finalVerdict === "AC",
      results: normalizedResults,
    });

    console.log("Submission published");
  } catch (err) {
    console.error("❌ DB Save Error:", err.message);
  }
});

worker.on("failed", (job, err) => {
  console.log("Job failed:", err.message);
});
