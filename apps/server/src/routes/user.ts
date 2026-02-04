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
import { getAnalyticsOverviewController } from "../modules/analytics/analytics.controller.js";

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
  analyticsOverviewSchema,
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

/* ===================== Analytics Overview ===================== */

userRouter.get(
  "/analytics/overview",
  authMiddleware,
  validateRequest(analyticsOverviewSchema),
  getAnalyticsOverviewController,
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

userRouter.patch(
  "/ping",
  authMiddleware,
  pingUserController,
);

userRouter.patch(
  "/focusing",
  authMiddleware,
  validateRequest(updateFocusingSchema),
  updateFocusingController,
);

/* ===================== Tags ===================== */

userRouter.get(
  "/tags",
  authMiddleware,
  getTagsController,
);

userRouter.post(
  "/create-tag",
  authMiddleware,
  validateRequest(createTagSchema),
  createTagController,
);

export default userRouter;
