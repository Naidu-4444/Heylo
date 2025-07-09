import express, { Request, Response } from "express";
import {
  getProfile,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth.middle";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", isAuthenticated, updateProfile);

router.get("/getuser", isAuthenticated, getProfile);

export default router;
