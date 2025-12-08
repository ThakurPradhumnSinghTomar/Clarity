// extractGlobalLeaderBoard.js
import prisma from "../prismaClient.js";
import { getCurrentWeekStart } from "./getCurrentWeekStart.js";

export async function extractGlobalLeaderBoard() {
  // 1) Figure out which week we are in right now
  const weekStart = getCurrentWeekStart();

  // 2) Query Prisma for this week's study hours for ALL users
  // -----------------------------------------------------------------
  // prisma.weeklyStudyHours.findMany({
  //   where: { ... },    // filter rows
  //   orderBy: { ... },  // sort result
  //   include: { ... }   // join related models
  // })
  //
  // Explanation:
  // - `where.weekStart: weekStart`
  //     → only pick rows whose `weekStart` date exactly matches the
  //       start-of-week we just computed.
  //
  // - `orderBy.totalSec: "desc"`
  //     → sort users by `totalSec` (total seconds studied this week)
  //       from highest to lowest → this is your leaderboard order.
  //
  // - `include.user: true`
  //     → join the related `User` document so we also get
  //       `name`, `email`, `image`, etc. in the same query.
  // -----------------------------------------------------------------
  const weeklyRows = await prisma.weeklyStudyHours.findMany({
    where: {
      weekStart: weekStart, // only current week’s records
    },
    orderBy: {
      totalSec: "desc", // highest study time first
    },
    include: {
      user: true, // pull full User info via relation
    },
  });

  // 3) Map result into a clean leaderboard structure
  //    You can shape this however you want for the frontend.
  const leaderboard = weeklyRows.map((row, index) => ({
    rank: index + 1,           // 1-based rank
    userId: row.userId,        // Mongo ObjectId string
    name: row.user?.name,      // from User model
    email: row.user?.email,    // from User model
    totalSec: row.totalSec,    // total seconds studied this week
    totalHours: +(row.totalSec / 3600).toFixed(2), // optional: for display
  }));

  // 4) Return array to whoever called this function
  return leaderboard;
}
