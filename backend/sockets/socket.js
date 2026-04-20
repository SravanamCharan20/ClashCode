import socketAuth from "../config/socketAuth.js";

const socketConnection = (io) => {
  io.use(socketAuth);
  io.on("connection", (socket) => {
    const userId = socket.user?._id?.toString();

    if (userId) {
      // Personal room keeps the setup flexible for future direct events.
      socket.join(`user:${userId}`);
    }

    console.log("socket connected", socket.id, userId ? `user:${userId}` : "");

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
export default socketConnection;
