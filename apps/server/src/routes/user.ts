import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

/* ===================== Controllers ===================== */

import { saveFocusSessionController } from "../modules/focus/focus.controller.js";
import { getRecentFocusSessionsController } from "../modules/focus/focus.controller.js";

import { getLeaderboardController } from "../modules/leaderboard/leaderboard.controller.js";

import { getWeeklyStudyHoursController } from "../modules/study-hours/studyHours.controller.js";
import { getWeeklyStudyHoursByTagsController } from "../modules/weekly-by-tags/weeklyByTags.controller.js";

import { getHeatmapDataController } from "../modules/heatmap/heatmap.controller.js";

import {
  getCurrentUserProfileController,
  updateUserProfileController,
  pingUserController,
  updateFocusingController,
} from "../modules/user/user.controller.js";

import {
  getTagsController,
  createTagController,
} from "../modules/tags/tags.controller.js";

/* ===================== Zod Schemas ===================== */

import {
  saveFocusSessionSchema,
  getWeeklyStudyHoursSchema,
  weeklyStudyHoursByTagsSchema,
  updateUserProfileSchema,
  updateFocusingSchema,
  createTagSchema,
  heatmapSchema,
} from "../modules/user/user.schema.js";

/* ===================== Router ===================== */

const userRouter = express.Router();

userRouter.get("/", (_, res) => {
  res.send("User API running!");
});

/* ===================== Leaderboard ===================== */

userRouter.get(
  "/leaderboard",
  authMiddleware,
  getLeaderboardController,
);

/* ===================== Focus Sessions ===================== */

userRouter.post(
  "/save-focus-sesssion",
  authMiddleware,
  validateRequest(saveFocusSessionSchema),
  saveFocusSessionController,
);

userRouter.get(
  "/focus-sessions/recent",
  authMiddleware,
  getRecentFocusSessionsController,
);

/* ===================== Study Hours ===================== */

userRouter.get(
  "/get-current-week-study-hours/:page",
  authMiddleware,
  validateRequest(getWeeklyStudyHoursSchema),
  getWeeklyStudyHoursController,
);

userRouter.get(
  "/get-weekly-study-hours-by-tags/:page",
  authMiddleware,
  validateRequest(weeklyStudyHoursByTagsSchema),
  getWeeklyStudyHoursByTagsController,
);

/* ===================== Heatmap ===================== */

userRouter.get(
  "/get-heatmap-data",
  authMiddleware,
  validateRequest(heatmapSchema),
  getHeatmapDataController,
);

/* ===================== User Profile ===================== */

userRouter.get(
  "/get-current-user-profile",
  authMiddleware,
  getCurrentUserProfileController,
);

userRouter.patch(
  "/update-profile",
  authMiddleware,
  validateRequest(updateUserProfileSchema),
  updateUserProfileController,
);

userRouter.post("/focusing/heartbeat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        lastPinged: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Focusing heartbeat recorded",
    });
  } catch (error) {
    console.error("Error in focusing heartbeat:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record focusing heartbeat",
    });
  }
});

export default userRouter;
