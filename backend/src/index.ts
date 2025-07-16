import express from "express";
import authRoutes from "./routes/auth.route";
import msgRoutes from "./routes/msg.route";
import dotenv from "dotenv";
import connectDB from "./lib/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket";
dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", msgRoutes);

server.listen(process.env.PORT, () => {
  console.log("Server running on the port:" + process.env.PORT);
  connectDB();
});
