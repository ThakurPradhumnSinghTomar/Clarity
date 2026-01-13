import express from "express";
import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { extractGlobalLeaderBoard } from "../controllers/extractGlobalLeaderBoard.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getCurrentWeekStart } from "../controllers/getCurrentWeekStart.js";
import type { Prisma__FocusSessionClient } from "../generated/prisma/models.js";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => res.send("Auth API running!"));

userRouter.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    // =========================================================
    // 1. Extract logged-in userId from the request
    // =========================================================
    //
    // OPTION A: if you have auth middleware that sets `req.user`
    // const currentUserId = req.user?.id;
    //
    // OPTION B: if frontend sends it in a custom header "x-user-id"
    const currentUserId = req.user?.id; // returns string or undefined

    // =========================================================
    // 2. Get the full leaderboard from DB
    // =========================================================
    //
    // This will return something like:
    // [
    //   { rank: 1, userId: "abc", name: "...", totalSec: 7200, totalHours: 2 },
    //   { rank: 2, userId: "def", ... },
    //   ...
    // ]
    const leaderboard = await extractGlobalLeaderBoard();

    // =========================================================
    // 3. Find the current user's row inside the leaderboard
    // =========================================================
    //
    // If currentUserId is present, we search for his entry.
    // If not found (e.g. user has no study hours this week), we return null.
    let currentUserEntry = null;

    if (currentUserId) {
      currentUserEntry =
        leaderboard.find((row) => row.userId === currentUserId) || null;
    }

    // =========================================================
    // 4. Send response to frontend
    // =========================================================
    //
    // - `leaderboard`: entire list (for table rendering)
    // - `currentUser`: just one object for logged-in user, can be null
    res.json({
      success: true,
      leaderboard,
      currentUser: currentUserEntry,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({
      success: false,
      message: "Server error while loading leaderboard",
    });
  }
});

userRouter.post("/save-focus-sesssion", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "unauthorized" });
    }

    const { startTime, endTime, durationSec, tag, note } = req.body;

    if (!startTime || !endTime || !durationSec) {
      return res.json({
        success: false,
        message:
          "missing required fields : starttime endtime or duration of focus",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: userId,
        startTime: start,
        endTime: end,
        durationSec: durationSec,
        tag: tag || null,
        note: note || null,
      },
    });

    const weekStart = new Date(start);
    weekStart.setHours(0, 0, 0, 0); //Reset the time part of this Date to exactly midnight.
    const dayOfweek = (weekStart.getDay() + 6) % 7; //ye date ho gyi kb tumne focus session start/run kiya tha, and y ab monady based week day dega like 0-monday,1-tuesday,..
    weekStart.setDate(weekStart.getDate() - dayOfweek); //perfect, ab y weekStart monady s hi set karega..

    const sessionWeekday = (start.getDay() + 6) % 7; //ab database m sunday k liye 6 jayega n ki 0

    let weeklyRecord = await prisma.weeklyStudyHours.findUnique({
      where: {
        userId_weekStart_wsh: {
          userId: userId,
          weekStart: weekStart,
        },
      },
    });

    if (!weeklyRecord) {
      weeklyRecord = await prisma.weeklyStudyHours.create({
        data: {
          userId: userId,
          weekStart: weekStart,
          days: [
            {
              weekday: sessionWeekday,
              focusedSec: durationSec,
            },
          ],
          totalSec: durationSec,
        },
      });
    } else {
      const existingWeekdayIndex = weeklyRecord.days.findIndex(
        (day) => day.weekday === sessionWeekday
      );

      let updatedDays;
      if (existingWeekdayIndex !== -1) {
        updatedDays = weeklyRecord.days.map((day, index) => {
          if (day.weekday === sessionWeekday) {
            return {
              focusedSec: day.focusedSec + durationSec,
              weekday: sessionWeekday,
            };
          }
          return day;
        });
      } else {
        updatedDays = [
          ...weeklyRecord.days,
          {
            weekday: sessionWeekday,
            focusedSec: durationSec,
          },
        ];
      }

      const newTotalSec = updatedDays.reduce(
        (sum, day) => sum + day.focusedSec,
        0
      );

      weeklyRecord = await prisma.weeklyStudyHours.update({
        where: {
          id: weeklyRecord.id,
        },
        data: {
          days: updatedDays,
          totalSec: newTotalSec,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "focus session saved successfully",
      data: { focusSession, weeklyRecord },
    });
  } catch (error) {
    console.error(error, "error saving focus session");
    res.status(500).json({
      success: false,
      message: "server error while saving focus session",
    });
  }
});

userRouter.get(
  "/get-current-week-study-hours/:page",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const page = Number(req.params.page);

      if (!userId) {
        console.log(
          "Unauthorized - no userId provided,req rejected in api route getting weekly study hours"
        );
        return res.status(401).json({
          success: false,
          message: "Unauthorized - no userId provided",
        });
      }

      const weeklyStudyHours = await prisma.weeklyStudyHours.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          weekStart: "desc",
        },
        skip: page,
        take: 1,
      });

      if (!weeklyStudyHours || weeklyStudyHours.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No study hours recorded for this week yet",
          weeklyStudyHours: null,
        });
      }

      return res.status(200).json({
        success: true,
        weeklyStudyHours: weeklyStudyHours[0], // Return the first (and only) item
      });
    } catch (err) {
      console.error("Error fetching weekly study hours:", err);
      return res.status(500).json({
        success: false,
        message: "Server error while fetching study hours",
        err,
      });
    }
  }
);

userRouter.get(
  "/get-current-user-profile",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        console.log("please provide userid in param to get user info...");
        return res.status(500).json({
          success: "false",
          message: "please provide userid in param to get user info...",
        });
      }

      const response = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          focusSessions: {
            select: { durationSec: true },
          },
        },
      });

      if (!response) {
        return res.status(500).json({
          success: "false",
          message: "unable to fetch user from prisma",
        });
      }

      return res.status(201).json({ success: "true", response });
    } catch (error) {
      console.log("error in getting user profile", error);
      return res.status(500).json({
        success: "false",
        message: "unable to fetch user from prisma",
        error,
      });
    }
  }
);

userRouter.patch("/update-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) throw new Error("userId is required");

    const { name, image } = req.body;

    if (!name && !image) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Return success (200 instead of 201)
    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
});

userRouter.patch("/ping", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastPing: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Ping updated",
    });
  } catch (error: any) {
    console.error("Ping error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update ping",
    });
  }
});

userRouter.patch("/focusing", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { isFocusing } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (typeof isFocusing !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isFocusing must be a boolean",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isFocusing },
    });

    return res.json({
      success: true,
      isFocusing,
    });
  } catch (err) {
    console.error("Update focusing error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

userRouter.get("/tags", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tags: true },
    });

    return res.status(200).json({
      success: true,
      message: "Here are your tags",
      tags: user?.tags || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
    });
  }
});

userRouter.post("/create-tag", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tag } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!tag || typeof tag !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid tag",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tags: true },
    });

    if (user?.tags?.includes(tag)) {
      return res.status(409).json({
        success: false,
        message: "Tag already exists",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        tags: {
          push: tag,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      tag,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create tag",
    });
  }
});

userRouter.get("/focus-sessions/recent", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfPastDays = new Date(startOfToday);
    startOfPastDays.setDate(startOfPastDays.getDate() - 4); // last 5 days total

    const sessions = await prisma.focusSession.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfPastDays,
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    const todaySessions = [];
    const pastSessions = [];

    for (const session of sessions) {
      if (session.startTime >= startOfToday) {
        todaySessions.push(session);
      } else {
        pastSessions.push(session);
      }
    }

    return res.status(200).json({
      success: true,
      today: todaySessions,
      pastSessions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch focus sessions",
    });
  }
});

function getPreviousWeekStart(currentWeekStart: Date, weeksAgo = 1) {
  const d = new Date(currentWeekStart);
  d.setDate(d.getDate() - weeksAgo * 7);
  return d;
}

userRouter.get(
  "/get-weekly-study-hours-by-tags/:page",
  authMiddleware,
  async (req, res) => {
    const userId = req.user?.id;
    const page = Number(req.params.page);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized" });
    }

    // calculate week range (mon -> sun)
    const currentWeekStart = getCurrentWeekStart();
    const gte = getPreviousWeekStart(currentWeekStart, page);

    let lte: Date;
    if (page === 0) {
      lte = new Date();
    } else {
      lte = new Date(gte);
      lte.setDate(gte.getDate() + 7);
    }

    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        startTime: {
          gte,
          lte,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    type FocusSession = (typeof focusSessions)[number];

    type DayGroup = {
      sessions: FocusSession[];
      totalDuration: number;
    };

    type TagGroup = {
      totalDuration: number;
      byDay: DayGroup[]; // index 0 = Monday ... 6 = Sunday
    };

    const sessionByTag: Record<string, TagGroup> = {};
    let weeklyTotalDuration = 0;

    for (const s of focusSessions) {
      const tag = s.tag ?? "untagged";

      if (!sessionByTag[tag]) {
        sessionByTag[tag] = {
          totalDuration: 0,
          byDay: Array.from({ length: 7 }, (): DayGroup => ({
            sessions: [],
            totalDuration: 0,
          })),
        };
      }

      // JS: 0=Sun,1=Mon,...6=Sat → convert to 0=Mon,...6=Sun
      const dayIndex = (s.startTime.getDay() + 6) % 7;

      sessionByTag[tag]!.byDay[dayIndex]!.sessions.push(s);
      sessionByTag[tag]!.byDay[dayIndex]!.totalDuration += s.durationSec;

      sessionByTag[tag].totalDuration += s.durationSec;
      weeklyTotalDuration += s.durationSec;
    }

    return res.json({
      success: true,
      week: {
        gte,
        lte,
        totalDuration: weeklyTotalDuration,
      },
      data: sessionByTag,
    });
  }
);

//
export default userRouter;

/*
❗ Important:

Fields like name, email, image, createdAt, emailVerified are scalar fields, NOT relations.
Prisma does NOT allow including scalar fields — they always come by default.


should not use dynamic values as keys because typescript can complain than object maybe undefined even if you handeled the null case of that dynamic value
*/
