import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/User.js";

const socketAuth = async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie || "";
    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.token;
    if (!token) {
      return next(new Error("Not authenticated"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Unauthorized"));
  }
};

export default socketAuth;
