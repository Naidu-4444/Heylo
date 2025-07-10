import express, { Request, Response } from "express";
import { isAuthenticated } from "../middleware/auth.middle";
import { getmsgs, getUsers, sendmsg } from "../controllers/msg.controller";

const router = express.Router();

router.get("/", isAuthenticated, getUsers);
router.get("/:id", isAuthenticated, getmsgs);
router.post("/send/:id", isAuthenticated, sendmsg);

export default router;
