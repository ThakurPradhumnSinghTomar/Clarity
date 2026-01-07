import express from "express";
import prisma from "../prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { extractGlobalLeaderBoard } from "../controllers/extractGlobalLeaderBoard.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getCurrentWeekStart } from "../controllers/getCurrentWeekStart.js";

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

      return res.status(200).json({
        success: true, // This was 'false' - should be 'true'
        weeklyStudyHours,
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


/*
userRouter.patch("/focusing", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { isFocusing } = req.body;

    if (typeof isFocusing !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isFocusing must be a boolean",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isFocusing },
    });

    return res.status(200).json({
      success: true,
      message: isFocusing ? "User started focusing" : "User stopped focusing",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

*/



userRouter.patch("/ping", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastPing: new Date(),
      },
    })

    return res.status(200).json({
      success: true,
      message: "Ping updated",
    })
  } catch (error: any) {
    console.error("Ping error:", error)

    return res.status(500).json({
      success: false,
      message: "Failed to update ping",
    })
  }
})


export default userRouter;

/*
❗ Important:

Fields like name, email, image, createdAt, emailVerified are scalar fields, NOT relations.
Prisma does NOT allow including scalar fields — they always come by default.

*/
