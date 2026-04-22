import socketAuth from "../config/socketAuth.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";
import IORedis from "ioredis";

const emitRoomError = (socket, message) => {
  socket.emit("room-error", { message });
};

const redisSub = new IORedis();

const socketConnection = (io) => {
  io.use(socketAuth);

  // Subscribe to submission results from workers
  redisSub.subscribe("submission-result");

  redisSub.on("message", (channel, message) => {
    if (channel === "submission-result") {
      try {
        const data = JSON.parse(message);
        const { userId, roomId, leaderboard, submission } = data;

        // Emit to user's personal room
        io.to(`user:${userId}`).emit("submission-result", data);

        const hasLeaderboard =
          Array.isArray(leaderboard) && leaderboard.length > 0;

        // Emit leaderboard updates to everyone in the room (if subscribed there)
        if (roomId && hasLeaderboard) {
          io.to(roomId).emit("leaderboard-update", {
            roomId,
            leaderboard,
          });
        }

        // Also emit to each participant's personal room to guarantee delivery in arena.
        if (hasLeaderboard) {
          leaderboard.forEach((entry) => {
            if (entry?.user) {
              io.to(`user:${entry.user}`).emit("leaderboard-update", {
                roomId,
                leaderboard,
              });
            }
          });
        }

        if (roomId && submission) {
          io.to(roomId).emit("submission-update", {
            roomId,
            submission,
          });

          // Also push submission feed updates through personal rooms so arena
          // users receive live updates even if they didn't join the room socket.
          if (hasLeaderboard) {
            leaderboard.forEach((entry) => {
              if (entry?.user) {
                io.to(`user:${entry.user}`).emit("submission-update", {
                  roomId,
                  submission,
                });
              }
            });
          }
        }
      } catch (err) {
        console.log("Redis parse error:", err.message);
      }
    }
  });
  io.on("connection", (socket) => {
    const userId = socket.user?._id?.toString();

    if (userId) {
      // Personal room keeps the setup flexible for future direct events.
      socket.join(`user:${userId}`);
    }

    console.log("socket connected", socket.id, userId ? `user:${userId}` : "");

    socket.on("join-room", async (roomId) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
          emitRoomError(socket, "Invalid room");
          return;
        }

        const room = await Room.findById(roomId);
        if (!room) {
          emitRoomError(socket, "Room not found");
          return;
        }

        if (room.status !== "waiting") {
          emitRoomError(socket, "Room already started");
          return;
        }

        const exists = room.participants.find(
          (p) => p.user.toString() === socket.user._id.toString(),
        );

        if (!exists) {
          room.participants.push({
            user: socket.user._id,
            username: socket.user.username,
          });

          await room.save();
        }

        socket.join(room._id.toString());
        io.to(roomId).emit("participants-update", room.participants);
      } catch (error) {
        console.log("join-room error:", error.message);
        emitRoomError(socket, "Could not join room");
      }
    });

    socket.on("start-room", async (roomId) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
          emitRoomError(socket, "Invalid room");
          return;
        }

        const room = await Room.findById(roomId);

        if (!room) {
          emitRoomError(socket, "Room not found");
          return;
        }

        if (room.admin.toString() !== socket.user._id.toString()) {
          emitRoomError(socket, "Only admin can start the room");
          return;
        }

        if (room.status === "started") {
          emitRoomError(socket, "Room already started");
          return;
        }

        room.status = "started";
        room.startTime = new Date();
        await room.save();

        io.to(roomId).emit("room-started");
      } catch (error) {
        console.log("start-room error:", error.message);
        emitRoomError(socket, "Could not start room");
      }
    });

    socket.on("toggle-ready", async (roomId) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
          emitRoomError(socket, "Invalid room");
          return;
        }

        const room = await Room.findById(roomId);
        if (!room) {
          emitRoomError(socket, "Room not found");
          return;
        }

        if (room.status !== "waiting") {
          emitRoomError(socket, "Room already started");
          return;
        }

        const participant = room.participants.find(
          (p) => p.user.toString() === socket.user._id.toString(),
        );

        if (!participant) {
          emitRoomError(socket, "Join the room before toggling ready");
          return;
        }

        participant.ready = !participant.ready;
        await room.save();

        io.to(roomId).emit("participants-update", room.participants);
      } catch (error) {
        console.log("toggle-ready error:", error.message);
        emitRoomError(socket, "Could not update ready state");
      }
    });

    socket.on("disconnect", async () => {
      try {
        console.log("User disconnected:", socket.id);

        const rooms = await Room.find({
          "participants.user": socket.user._id,
          status: "waiting",
        });

        for (const room of rooms) {
          room.participants = room.participants.filter(
            (p) => p.user.toString() !== socket.user._id.toString(),
          );

          await room.save();

          io.to(room._id.toString()).emit(
            "participants-update",
            room.participants,
          );
        }
      } catch (error) {
        console.log("disconnect error:", error.message);
      }
    });
  });
};
export default socketConnection;
