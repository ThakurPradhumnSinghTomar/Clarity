import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { saveFocusSessionController } from "../modules/focus/focus.controller.js";
import { getLeaderboardController } from "../modules/leaderboard/leaderboard.controller.js";
import { getWeeklyStudyHoursController } from "../modules/study-hours/studyHours.controller.js";
import { getWeeklyStudyHoursByTagsController } from "../modules/weekly-by-tags/weeklyByTags.controller.js";
import { getRecentFocusSessionsController } from "../modules/focus/focus.controller.js";
import { getHeatmapDataController } from "../modules/heatmap/heatmap.controller.js";

import {
  pingUserController,
  updateFocusingController,
} from "../modules/user/user.controller.js";

import {
  getTagsController,
  createTagController,
} from "../modules/tags/tags.controller.js";

import {
  getCurrentUserProfileController,
  updateUserProfileController,
} from "../modules/user/user.controller.js";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => res.send("Auth API running!"));

userRouter.get("/leaderboard", authMiddleware, getLeaderboardController);

userRouter.post(
  "/save-focus-sesssion",
  authMiddleware,
  saveFocusSessionController,
);

userRouter.get(
  "/get-current-week-study-hours/:page",
  authMiddleware,
  getWeeklyStudyHoursController,
);

userRouter.get(
  "/get-current-user-profile",
  authMiddleware,
  getCurrentUserProfileController,
);

userRouter.patch(
  "/update-profile",
  authMiddleware,
  updateUserProfileController,
);

userRouter.patch("/ping", authMiddleware, pingUserController);
userRouter.patch("/focusing", authMiddleware, updateFocusingController);

userRouter.get("/tags", authMiddleware, getTagsController);
userRouter.post("/create-tag", authMiddleware, createTagController);

userRouter.get(
  "/focus-sessions/recent",
  authMiddleware,
  getRecentFocusSessionsController,
);

userRouter.get(
  "/get-weekly-study-hours-by-tags/:page",
  authMiddleware,
  getWeeklyStudyHoursByTagsController,
);

userRouter.get("/get-heatmap-data", authMiddleware, getHeatmapDataController);

//
export default userRouter;

/*
❗ Important:

Fields like name, email, image, createdAt, emailVerified are scalar fields, NOT relations.
Prisma does NOT allow including scalar fields — they always come by default.


should not use dynamic values as keys because typescript can complain than object maybe undefined even if you handeled the null case of that dynamic value
*/
