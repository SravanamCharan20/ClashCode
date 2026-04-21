import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import socketConnection from "./sockets/socket.js";
import userRouter from "./routes/userRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import problemRouter from "./routes/problemRoutes.js";
import executionRouter from "./routes/executionRoutes.js";
import seedProblems from "./config/seedProblems.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9999;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});

socketConnection(io);
app.set("io", io);

// Routes
app.use("/auth", userRouter);
app.use("/room", roomRouter);
app.use("/problem", problemRouter);
app.use("/exec", executionRouter);

const startServer = async () => {
  try {
    await connectDB();
    await seedProblems();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
