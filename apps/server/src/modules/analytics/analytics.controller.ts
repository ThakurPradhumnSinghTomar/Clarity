import type { Request, Response } from "express";
import { getAnalyticsOverview, getFocusInsights } from "./analytics.service.js";

export async function getAnalyticsOverviewController(
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

    const overview = await getAnalyticsOverview(userId);

    return res.status(200).json({
      success: true,
      overview,
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching analytics overview",
    });
  }
}

export async function getFocusInsightsController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const insights = await getFocusInsights(userId);

    return res.status(200).json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("Focus insights error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching focus insights",
    });
  }
}
