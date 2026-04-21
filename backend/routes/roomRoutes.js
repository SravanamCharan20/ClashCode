import express from "express";
import mongoose from "mongoose";
import userAuth from "../config/auth.js";
import Room from "../models/Room.js";
import Problem from "../models/Problem.js";

const roomRouter = express.Router();

const generateRoomCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const createUniqueRoomCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomCode = generateRoomCode();
    const existingRoom = await Room.exists({ roomCode });

    if (!existingRoom) {
      return roomCode;
    }
  }

  throw new Error("Could not generate unique room code");
};

roomRouter.post("/create-room", userAuth("admin"), async (req, res) => {
  try {
    const selectedProblemIds = Array.isArray(req.body.problemIds)
      ? req.body.problemIds
      : [];
    const duration = Number(req.body.duration);

    if (selectedProblemIds.length === 0) {
      return res.status(400).json({ message: "Select at least one problem" });
    }

    if (Number.isNaN(duration) || duration < 15 || duration > 300) {
      return res.status(400).json({
        message: "Duration must be between 15 and 300 minutes",
      });
    }

    const uniqueProblemIds = [...new Set(selectedProblemIds)];
    const validProblemIds = uniqueProblemIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );

    if (validProblemIds.length !== uniqueProblemIds.length) {
      return res.status(400).json({ message: "Invalid problem selection" });
    }

    const selectedProblems = await Problem.find({
      _id: { $in: validProblemIds },
    }).select("_id");

    if (selectedProblems.length !== validProblemIds.length) {
      return res
        .status(400)
        .json({ message: "Some selected problems were not found" });
    }

    const roomCode = await createUniqueRoomCode();
    const room = await Room.create({
      roomCode,
      admin: req.user._id,
      duration,
      participants: [
        {
          user: req.user._id,
          username: req.user.username,
        },
      ],
      problems: selectedProblems.map((problem, index) => ({
        problem: problem._id,
        index,
      })),
    });

    const populatedRoom = await Room.findById(room._id).populate("problems.problem");

    res.status(201).json({
      message: "Room created",
      room: {
        id: populatedRoom._id,
        roomCode: populatedRoom.roomCode,
        status: populatedRoom.status,
        duration: populatedRoom.duration,
        participants: populatedRoom.participants,
        problems: populatedRoom.problems.map((entry) => ({
          index: entry.index,
          problem: entry.problem,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while creating room",
      error: error.message,
    });
  }
});

roomRouter.post("/join-room", userAuth(), async (req, res) => {
  try {
    const roomCode = req.body.roomCode?.trim().toUpperCase();

    if (!roomCode) {
      return res.status(400).json({ message: "Room code is required" });
    }

    const room = await Room.findOne({ roomCode }).populate("problems.problem");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.status !== "waiting") {
      return res.status(400).json({ message: "Room already started" });
    }

    const alreadyJoined = room.participants.find(
      (participant) => participant.user.toString() === req.user._id.toString(),
    );

    if (!alreadyJoined) {
      room.participants.push({
        user: req.user._id,
        username: req.user.username,
      });

      await room.save();
    }

    res.json({
      message: "Joined room successfully",
      room: {
        id: room._id,
        roomCode: room.roomCode,
        status: room.status,
        duration: room.duration,
        participants: room.participants,
        problems: room.problems.map((entry) => ({
          index: entry.index,
          problem: entry.problem,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error joining room", error: error.message });
  }
});

roomRouter.get("/:roomId", userAuth(), async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    const room = await Room.findById(roomId).populate("problems.problem");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.json({
      room: {
        id: room._id,
        roomCode: room.roomCode,
        status: room.status,
        duration: room.duration,
        startTime: room.startTime,
        participants: room.participants,
        problems: room.problems.map((entry) => ({
          index: entry.index,
          problem: entry.problem,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching room",
      error: error.message,
    });
  }
});

export default roomRouter;
