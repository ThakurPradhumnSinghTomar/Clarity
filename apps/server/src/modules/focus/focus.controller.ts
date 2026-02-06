import { saveFocusSession } from "./focus.service.js";
import type { Request, Response, NextFunction } from "express";
import { getRecentFocusSessions } from "./focus.service.js";



export async function saveFocusSessionController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { startTime, endTime, durationSec, tag, note } = req.body;

    if (!startTime || !endTime || durationSec <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const data = await saveFocusSession({
      userId,
      startTime: start,
      endTime: end,
      durationSec,
      tag,
      note,
    });

    return res.status(201).json({
      success: true,
      message: "focus session saved successfully",
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}


export async function getRecentFocusSessionsController(
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

    const data = await getRecentFocusSessions(userId);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Recent focus sessions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch focus sessions",
    });
  }
}
