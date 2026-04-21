// models/Problem.js
import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    isHidden: { type: Boolean, default: true },
  },
  { _id: false },
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String, default: "" },
      },
    ],
    inputFormat: String,
    outputFormat: String,
    constraints: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    points: {
      type: Number,
      default: 100,
    },
    tags: [
      {
        type: String,
        enum: [
          "arrays",
          "hashing",
          "two-pointers",
          "sliding-window",
          "stack",
          "queue",
          "binary-search",
          "dp",
          "graph",
          "tree",
          "greedy",
        ],
      },
    ],
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
    },
    testCases: [testCaseSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Problem", problemSchema);
