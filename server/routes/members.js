import express from "express";
import Club from "../models/Club.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// get members of a club
router.get("/club/:clubId", authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId).populate(
      "members.userId",
      "name email"
    );

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const formatted = club.members.map((m) => ({
      userId: m.userId._id.toString(),
      name: m.userId.name,
      email: m.userId.email,
      role: m.role,
    }));

    res.json(formatted);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
