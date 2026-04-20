import socketAuth from "../config/socketAuth.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";

const emitRoomError = (socket, message) => {
  socket.emit("room-error", { message });
};

const socketConnection = (io) => {
  io.use(socketAuth);
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
        await room.save();

        io.to(roomId).emit("room-started");
      } catch (error) {
        console.log("start-room error:", error.message);
        emitRoomError(socket, "Could not start room");
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
