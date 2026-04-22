import express from "express";
import mongoose from "mongoose";
import userAuth from "../config/auth.js";
import Room from "../models/Room.js";
import { evaluateSubmission } from "../services/judgeService.js";
import { submissionQueue } from "../services/queueService.js";

const executionRouter = express.Router();

executionRouter.post("/run-code", userAuth(), async (req, res) => {
  try {
    const { code, language, roomId, problemId } = req.body;

    // validating the requests
    if (!code?.trim()) {
      return res.status(400).json({ message: "Code is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId || "")) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId || "")) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const room = await Room.findById(roomId).populate("problems.problem");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isParticipant = room.participants.some(
      (p) => p.user.toString() === req.user._id.toString(),
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const problemEntry = room.problems.find(
      (p) => p.problem?._id?.toString() === problemId,
    );

    if (!problemEntry?.problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const visibleTestCases = (problemEntry.problem.testCases || []).filter(
      (tc) => !tc.isHidden,
    );

    // passing the code to judge
    const result = await evaluateSubmission({
      code,
      language,
      testCases: visibleTestCases,
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Execution error while running code!!",
      error: error.message,
    });
  }
});

executionRouter.post("/submit-code", userAuth(), async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const userId = req.user.id;
    if (!code?.trim()) {
      return res.status(400).json({ message: "Code is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId || "")) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const job = submissionQueue.add("submission", {
      code,
      language,
      problemId,
      userId,
    });

    return res.json({
      success: true,
      jobId: job.id,
      message: "Submission received",
    });
    
  } catch (error) {
    return res.status(500).json({
      message: "Execution error while Submitting code!!",
      error: error.message,
    });
  }
});

export default executionRouter;
