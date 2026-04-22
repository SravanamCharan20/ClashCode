import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: String,
  expected: String,
  output: String,
  verdict: String,
});

const submissionSchema = new mongoose.Schema({
  userId: String,
  problemId: String,
  roomId: String,

  code: String,
  language: String,

  verdict: String, // AC / WA / TLE / RE

  testCases: [testCaseSchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Submission = mongoose.model("Submission", submissionSchema);