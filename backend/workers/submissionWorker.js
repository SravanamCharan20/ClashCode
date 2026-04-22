import { Worker } from "bullmq";
import IORedis from "ioredis";
import { executeCode } from "../services/executionService.js";
import { judge } from "../services/judgeService.js";
import { Submission } from "../models/Submission.js";
import connectDB from "../config/db.js";
import { publishSubmission } from "../config/redisPublisher.js";
import Room from "../models/Room.js";
import "../models/Problem.js";

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
    const { code, language, roomId, problemId, userId } = job.data;
    console.log("Processing job:", job.id);

    const room = await Room.findById(roomId).populate("problems.problem");
    if (!room) {
      throw new Error(`Room not found for submission: ${roomId}`);
    }

    const problemEntry = (room.problems || []).find(
      (entry) => entry.problem?._id?.toString() === problemId?.toString(),
    );
    if (!problemEntry?.problem) {
      throw new Error(`Problem ${problemId} not found in room ${roomId}`);
    }

    const testCases = (problemEntry.problem.testCases || []).map((test) => ({
      input: test.input,
      expected: test.output,
      isHidden: Boolean(test.isHidden),
    }));

    if (testCases.length === 0) {
      throw new Error(`No test cases configured for problem ${problemId}`);
    }

    const results = [];
    for (const test of testCases) {
      const output = await executeCode({
        code,
        language,
        input: test.input,
      });
      // Safety check for execution failure
      if (!output.success) {
        const errorType = (output.errorType || "").toLowerCase();
        const verdict =
          errorType === "timeout"
            ? "TLE"
            : errorType === "memory"
              ? "MLE"
              : "RE";
        results.push({
          input: test.input,
          expected: test.expected,
          output,
          verdict,
          isHidden: test.isHidden,
        });
        break;
      }
      const verdict = judge(output.stdout, test.expected);

      results.push({
        input: test.input,
        expected: test.expected,
        output,
        verdict,
        isHidden: test.isHidden,
      });

      if (verdict !== "AC") break; // stop early like LeetCode
    }
    return {
      userId,
      problemId,
      results,
    };
  },
  {
    connection,
    // Keep submissions independent across users. A single stuck job
    // should not block the entire queue.
    concurrency: 5,
  },
);

worker.on("completed", async (job, result) => {
  console.log("Job completed:", job.id);

  try {
    const WRONG_VERDICT_PENALTY = {
      WA: 10,
      RE: 15,
      TLE: 20,
      MLE: 20,
    };

    const normalizeParticipant = (participant) => {
      if (!Array.isArray(participant.solvedProblems)) {
        participant.solvedProblems = [];
      }
      participant.solvedProblems = participant.solvedProblems.map((id) =>
        id?.toString?.() || String(id),
      );
      participant.score = Number.isFinite(Number(participant.score))
        ? Number(participant.score)
        : 0;
      if (!participant.lastSolvedAt) {
        participant.lastSolvedAt = null;
      }
    };

    const room = await Room.findById(job.data.roomId);
    if (!room) {
      console.error("❌ Room not found for submission:", job.data.roomId);
      return;
    }
    room.participants.forEach(normalizeParticipant);

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
    const participant = room.participants.find(
      (p) => p.user?.toString() === result.userId.toString(),
    );

    if (participant) {
      // Apply scoring updates only until first AC for this problem.
      const normalizedProblemId = result.problemId?.toString();
      const alreadySolved = participant.solvedProblems?.includes(
        normalizedProblemId,
      );

      if (!alreadySolved) {
        if (finalVerdict === "AC") {
          participant.score += 100;
          participant.solvedProblems.push(normalizedProblemId);
          participant.lastSolvedAt = new Date();
        } else {
          const penalty = WRONG_VERDICT_PENALTY[finalVerdict] || 0;
          participant.score -= penalty;
        }
      }
    }
    await room.save();

    const leaderboard = [...room.participants]
      .sort((a, b) => {
        if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);

        const aTime = a.lastSolvedAt ? new Date(a.lastSolvedAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.lastSolvedAt ? new Date(b.lastSolvedAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      })
      .map((participant, index) => ({
        rank: index + 1,
        user: participant.user?.toString() || "",
        username: participant.username,
        score: participant.score || 0,
        solved: participant.solvedProblems?.length || 0,
        solvedProblems: participant.solvedProblems || [],
        lastSolvedAt: participant.lastSolvedAt || null,
      }));

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
    const submissionUser = room.participants.find(
      (p) => p.user?.toString() === result.userId.toString(),
    );

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
      leaderboard,
      submission: {
        id: saved._id.toString(),
        roomId: job.data.roomId,
        userId: result.userId,
        username: submissionUser?.username || "Participant",
         problemId: result.problemId,
        language: job.data.language,
        verdict: finalVerdict,
        createdAt: saved.createdAt,
      },
    });

    console.log("Submission published");
  } catch (err) {
    console.error("❌ DB Save Error:", err.message);
  }
});

worker.on("failed", (job, err) => {
  console.log("Job failed:", err.message);
});
