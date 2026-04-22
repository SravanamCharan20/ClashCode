import { Worker } from "bullmq";
import IORedis from "ioredis";
import { executeCode } from "../services/executionService.js";
import { judge } from "../services/judgeService.js";

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


worker.on("completed", (job, result) => {
  console.log("Job completed:", job.id);
  console.log("Result:", JSON.stringify(result, null, 2));
  // TODO:
  // 1. Save to DB
  // 2. Emit via socket
});

worker.on("failed", (job, err) => {
  console.log("Job failed:", err.message);
});