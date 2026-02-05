import type { Request, Response } from "express";
import {
  getWeeklyBreakdownByTag,
  getWeeklyTimePerTag,
} from "./tagIntelligence.service.js";

export async function getWeeklyTimePerTagController(req: Request, res: Response) {
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

    const result = await getWeeklyTimePerTag(userId, page);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Weekly time-per-tag error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getWeeklyBreakdownByTagController(
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

    const result = await getWeeklyBreakdownByTag(userId, page);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Weekly tag-breakdown error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
