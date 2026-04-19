import express from "express";
import User from "../models/User.js";
import userAuth from "../config/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required!!" });
    }

    const isUserExisted = await User.findOne({ email });
    if (isUserExisted) {
      return res.status(401).json({ message: "Email already exist!!" });
    }

    const newUser = await User.create({ username, email, password });
    const userResponse = newUser.toObject();
    delete userResponse.password; // removing password

    return res.status(201).json({
      message: "User created successfully!!!",
      userResponse,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while signup!!",
      error: error.message,
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!!", });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPassMatched = await user.comparePassword(password);
    if (!isPassMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = user.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      message: "Login successfull!!",
      userResponse,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error while signin!!",error: error.message });
  }
});

userRouter.get("/me", userAuth(), async (req, res) => {
  const user = req.user.toObject();
  delete user.password;

  res.json({
    user,
  });
});

userRouter.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ message: "Logged out successfully" });
});
export default userRouter;
