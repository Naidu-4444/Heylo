import { Request, Response } from "express";
import User from "../models/user.model";
import Message from "../models/message.model";
import cloudinary from "../lib/cloudinary";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const userloggedIn = req.user._id;
    const allusers = await User.find({ _id: { $ne: userloggedIn } }).select(
      "-password"
    );
    res.status(200).json(allusers);
  } catch (error) {
    console.log("Error in getUsers", error);
    res.status(500).json({ message: "Error in getUsers" });
  }
};

export const getmsgs = async (req: Request, res: Response) => {
  try {
    const { id: receiver } = req.params;
    const userloggedIn = req.user._id;
    const msgs = await Message.find({
      $or: [
        { senderId: userloggedIn, receiverId: receiver },
        { senderId: receiver, receiverId: userloggedIn },
      ],
    });
    res.status(200).json(msgs);
  } catch (error) {
    console.log("Error in getmsgs", error);
    res.status(500).json({ message: "Error in getmsgs" });
  }
};

export const sendmsg = async (req: Request, res: Response) => {
  try {
    const { text, image } = req.body;
    const userloggedIn = req.user._id;
    const { id: receiver } = req.params;
    let imageUrl;
    if (image) {
      const uploadpic = await cloudinary.uploader.upload(image);
      imageUrl = uploadpic.secure_url;
    }
    const newMessage = new Message({
      senderId: userloggedIn,
      receiverId: receiver,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    res.status(201).json({
      message: "Message sent successfully",
    });
  } catch (error) {
    console.log("Error in sendmsg", error);
    res.status(500).json({ message: "Error in sendmsg" });
  }
};
