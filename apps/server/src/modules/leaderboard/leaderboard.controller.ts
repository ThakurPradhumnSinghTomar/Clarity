import type { Request, Response } from "express";
import { getGlobalLeaderboard } from "./leaderboard.service.js";

export async function getLeaderboardController(
  req: Request,
  res: Response,
) {
  try {
    const currentUserId = req.user?.id ?? null;

    const leaderboard = await getGlobalLeaderboard();

    const currentUser =
      currentUserId
        ? leaderboard.find((row) => row.userId === currentUserId) ?? null
        : null;

    return res.json({
      success: true,
      leaderboard,
      currentUser,
    });
  } catch (err) {
    console.error("Leaderboard controller error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while loading leaderboard",
    });
  }
}
