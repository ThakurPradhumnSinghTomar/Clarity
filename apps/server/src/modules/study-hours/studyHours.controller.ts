import type { Request, Response } from "express";
import { getWeeklyStudyHours } from "./studyHours.service.js";

export async function getWeeklyStudyHoursController(
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

    const weeklyStudyHours = await getWeeklyStudyHours(userId, page);

    if (!weeklyStudyHours) {
      return res.status(200).json({
        success: true,
        message: "No study hours recorded for this week",
        weeklyStudyHours: null,
      });
    }

    return res.status(200).json({
      success: true,
      weeklyStudyHours,
    });
  } catch (error) {
    console.error("Weekly study hours error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching study hours",
    });
  }
}
