import type { Request, Response } from "express";
import { getHeatmapData } from "./heatmap.service.js";

export async function getHeatmapDataController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const heatmapData = await getHeatmapData(userId);

    return res.status(200).json({
      success: true,
      message: "weekly heatmap data (past 7 weeks + current)",
      finalWeekData: heatmapData,
    });
  } catch (error) {
    console.error("Heatmap error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
