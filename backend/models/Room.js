import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    ready: {
      type: Boolean,
      default: false,
    },
    solvedProblems: [String],
    score: { type: Number, default: 0 },
    lastSolvedAt: Date,
  },
  { _id: false },
);

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: {
      type: [participantSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["waiting", "started", "completed", "terminated"],
      default: "waiting",
    },

    problems: [
      {
        problem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },
        index: {
          type: Number, // 0,1,2,3
          required: true,
        },
      },
    ],
    startTime: Date,
    duration: Number,
  },
  { timestamps: true },
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
