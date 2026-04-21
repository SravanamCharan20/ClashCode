// routes/problem.routes.js

import express from "express";
import Problem from "../models/Problem.js";

const problemRouter = express.Router();

problemRouter.get("/", async (req, res) => {
  try {
    const { tags, difficulty } = req.query;

    let filter = {};

    // 🔥 filter by tags
    if (tags) {
      const tagsArray = tags.split(",");
      filter.tags = { $in: tagsArray };
    }

    // 🔥 filter by difficulty
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const problems = await Problem.find(filter).limit(50);

    res.json({ problems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

problemRouter.get("/:problemId", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    return res.json({ problem });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default problemRouter;
