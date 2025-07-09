import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils";
import cloudinary from "../lib/cloudinary";

export const signup = async (req: Request, res: Response) => {
  const { email, fullName, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "Email already exists." });
    }
    if (!email || !fullName || !password) {
      res
        .status(400)
        .json({ message: "Please provide all the required fields." });
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const newUser = new User({ email, fullName, password: hashed });
    if (!newUser) {
      res.status(400).json({ message: "Error creating user." });
    }
    await newUser.save();
    generateToken(newUser._id.toString(), res);
    res
      .status(201)
      .json({ id: newUser._id, message: "User created successfully." });
  } catch (error) {
    console.log("Error creating user:", error);
    res.status(500).json({ message: "Error creating user." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    generateToken(user._id.toString(), res);

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error logging out:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Please provide a profile picture" });
    }
    const uploaded = await cloudinary.uploader.upload(profilePic);
    await User.updateOne({ _id: userId }, { profilePic: uploaded.secure_url });
    return res
      .status(200)
      .json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.log("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error getting profile:", error);
    res.status(500).json({ message: "Error getting profile" });
  }
};
