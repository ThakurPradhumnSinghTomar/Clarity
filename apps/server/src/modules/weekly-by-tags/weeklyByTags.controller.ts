import type { Request, Response } from "express";
import { getWeeklyStudyHoursByTags } from "./weeklyByTags.service.js";

export async function getWeeklyStudyHoursByTagsController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.id;
    const page = Number(req.params.page);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (Number.isNaN(page) || page < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number",
      });
    }

    const result = await getWeeklyStudyHoursByTags(userId, page);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Weekly by tags error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
