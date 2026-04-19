import jwt from "jsonwebtoken";
import User from "../models/User.js";

const userAuth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
        error: error.message,
      });
    }
  };
};

export default userAuth;