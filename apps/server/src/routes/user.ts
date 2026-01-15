import express from "express";
import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { extractGlobalLeaderBoard } from "../controllers/extractGlobalLeaderBoard.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getCurrentWeekStart } from "../controllers/getCurrentWeekStart.js";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => res.send("Auth API running!"));

function getWeekStartUTC(date: Date) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);

  return d;
}

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

    if (!startTime || !endTime || durationSec <= 0) {
      return res.status(400).json({
        success: false,
        message: "missing or invalid fields",
      });
    }

    /* ===================== Normalize inputs ===================== */

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "invalid date format",
      });
    }

    /* ===================== Create Focus Session ===================== */

    const focusSession = await prisma.focusSession.create({
      data: {
        userId,
        startTime: start,
        endTime: end,
        durationSec,
        tag: tag || null,
        note: note || null,
      },
    });

    /* ===================== Weekly aggregation ===================== */

    // ✅ Canonical, UTC-safe week start (DO NOT TOUCH AFTER THIS)
    const weekStart = getWeekStartUTC(start);

    // ✅ Monday-based weekday (0 = Monday, 6 = Sunday)
    const sessionWeekday = (start.getUTCDay() + 6) % 7;

    // Find weekly record safely (Mongo + Date-safe)
    let weeklyRecord = await prisma.weeklyStudyHours.findFirst({
      where: {
        userId,
        weekStart: {
          equals: weekStart,
        },
      },
    });

    if (!weeklyRecord) {
      // 🆕 First session of the week
      weeklyRecord = await prisma.weeklyStudyHours.create({
        data: {
          userId,
          weekStart,
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
      // 🔁 Update existing week
      const existingDay = weeklyRecord.days.find(
        (d) => d.weekday === sessionWeekday
      );

      const updatedDays = existingDay
        ? weeklyRecord.days.map((d) =>
            d.weekday === sessionWeekday
              ? { ...d, focusedSec: d.focusedSec + durationSec }
              : d
          )
        : [
            ...weeklyRecord.days,
            { weekday: sessionWeekday, focusedSec: durationSec },
          ];

      const newTotalSec = updatedDays.reduce(
        (sum, d) => sum + d.focusedSec,
        0
      );

      weeklyRecord = await prisma.weeklyStudyHours.update({
        where: { id: weeklyRecord.id },
        data: {
          days: updatedDays,
          totalSec: newTotalSec,
        },
      });
    }

    /* ===================== Response ===================== */

    return res.status(201).json({
      success: true,
      message: "focus session saved successfully",
      data: {
        focusSession,
        weeklyRecord,
      },
    });
  } catch (error) {
    console.error("error saving focus session:", error);
    return res.status(500).json({
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
    startOfPastDays.setDate(startOfPastDays.getDate() - 1); // current day only
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
      return res.status(401).json({ success: false, message: "unauthorized" });
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
          byDay: Array.from(
            { length: 7 },
            (): DayGroup => ({
              sessions: [],
              totalDuration: 0,
            })
          ),
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

userRouter.get(
  "/get-daily-study-hours-of-8-weeks",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "unauthorized" });
      }

      const WEEKS = 8;
      const DAYS = WEEKS * 7;

      const currWeekStart = getCurrentWeekStart(); // Monday 00:00
      console.log("current week start is : ", currWeekStart); //this will show time in UTC IST = UTC + 5 hours 30 minutes
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const rangeStart = new Date(today);
      rangeStart.setDate(rangeStart.getDate() - (DAYS - 2));

      console.log(
        "we are taking chart data from the weeks whom weekStart is greater than : ",
        rangeStart
      );

      const weeklyStudyHours = await prisma.weeklyStudyHours.findMany({
        where: {
          userId,
          weekStart: {
            gte: rangeStart,
          },
        },
        select: {
          weekStart: true,
          days: true,
        },
      });

      // Map: yyyy-mm-dd -> focusedSec
      const dayMap = new Map<string, number>();

      for (const week of weeklyStudyHours) {
        for (const day of week.days) {
          const date = new Date(week.weekStart);
          date.setDate(date.getDate() + day.weekday);

          const key = date.toISOString().slice(0, 10);
          dayMap.set(key, (dayMap.get(key) || 0) + day.focusedSec);
          console.log("date " + key + " has focused sec ", dayMap.get(key));
        }
      }

      // Build continuous 56-day timeline
      const result = [];
      const cursor = new Date(rangeStart);

      for (let i = 0; i < DAYS; i++) {
        const key = cursor.toISOString().slice(0, 10);

        result.push({
          date: key,
          focusedSec: dayMap.get(key) || 0,
        });

        cursor.setDate(cursor.getDate() + 1);
      }

      console.log("your chart final data is : ", result);

      return res.json({
        success: true,
        days: result,
      });
    } catch (err) {
      console.error("daily study hours error", err);
      return res.status(500).json({
        success: false,
        message: "internal server error",
      });
    }
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
