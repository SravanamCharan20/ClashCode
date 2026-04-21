import express from "express";
import mongoose from "mongoose";
import userAuth from "../config/auth.js";
import Room from "../models/Room.js";
import Problem from "../models/Problem.js";

const roomRouter = express.Router();

const getContestMeta = (room) => {
  const startedAt = room.startTime ? new Date(room.startTime) : null;
  const durationMinutes = Number(room.duration) || 0;
  const endsAt =
    startedAt && durationMinutes > 0
      ? new Date(startedAt.getTime() + durationMinutes * 60 * 1000)
      : null;
  const remainingMs = endsAt ? endsAt.getTime() - Date.now() : null;
  const remainingSeconds =
    remainingMs === null ? null : Math.max(0, Math.ceil(remainingMs / 1000));
  const isExpired = Boolean(endsAt && remainingMs <= 0);

  return {
    startedAt,
    endsAt,
    remainingSeconds,
    isExpired,
  };
};

const syncRoomStatus = async (room) => {
  const contestMeta = getContestMeta(room);

  if (room.status === "started" && contestMeta.isExpired) {
    room.status = "completed";
    await room.save();
  }

  return {
    room,
    contestMeta: getContestMeta(room),
  };
};

const serializeRoom = (room, contestMeta) => ({
  id: room._id,
  roomCode: room.roomCode,
  status: room.status,
  duration: room.duration,
  startTime: room.startTime,
  startedAt: contestMeta.startedAt,
  endsAt: contestMeta.endsAt,
  remainingSeconds: contestMeta.remainingSeconds,
  participantsCount: room.participants.length,
  problemsCount: room.problems.length,
  participants: room.participants,
  problems: room.problems.map((entry) => ({
    index: entry.index,
    problem: entry.problem,
  })),
});

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

    const populatedRoom = await Room.findById(room._id).populate(
      "problems.problem",
    );

    res.status(201).json({
      message: "Room created",
      room: serializeRoom(populatedRoom, getContestMeta(populatedRoom)),
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
      room: serializeRoom(room, getContestMeta(room)),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error joining room", error: error.message });
  }
});

roomRouter.get("/running-room", userAuth(), async (req, res) => {
  try {
    const userId = req.user._id;

    const runningRooms = await Room.find({
      status: "started",
      "participants.user": userId,
    })
      .sort({ startTime: -1, updatedAt: -1 })
      .populate("problems.problem");

    let activeRoom = null;
    let activeMeta = null;

    for (const room of runningRooms) {
      const synced = await syncRoomStatus(room);

      if (synced.room.status === "started") {
        activeRoom = synced.room;
        activeMeta = synced.contestMeta;
        break;
      }
    }

    if (!activeRoom) {
      return res.status(404).json({
        message: "No running contest found for this user",
      });
    }

    return res.json({
      message: "Running contest found",
      room: serializeRoom(activeRoom, activeMeta),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching running room",
      error: error.message,
    });
  }
});

roomRouter.post("/:roomId/terminate", userAuth(), async (req, res) => {
  try {
    const { roomId } = req.params;
    const io = req.app.get("io");

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    const room = await Room.findById(roomId).populate("problems.problem");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the room admin can terminate this room" });
    }

    if (room.status === "terminated") {
      return res.status(400).json({ message: "Room already terminated" });
    }

    room.status = "terminated";
    await room.save();

    if (io) {
      io.to(room._id.toString()).emit("room-terminated", {
        roomId: room._id.toString(),
        roomCode: room.roomCode,
        message: "Room terminated by admin",
      });

      room.participants.forEach((participant) => {
        io.to(`user:${participant.user.toString()}`).emit("room-terminated", {
          roomId: room._id.toString(),
          roomCode: room.roomCode,
          message: "Room terminated by admin",
        });
      });
    }

    return res.json({
      message: "Room terminated successfully",
      room: serializeRoom(room, getContestMeta(room)),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error terminating room",
      error: error.message,
    });
  }
});

roomRouter.get("/:roomId", userAuth(), async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    const foundRoom = await Room.findById(roomId).populate("problems.problem");

    if (!foundRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    const { room, contestMeta } = await syncRoomStatus(foundRoom);

    return res.json({
      room: serializeRoom(room, contestMeta),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching room",
      error: error.message,
    });
  }
});

export default roomRouter;
