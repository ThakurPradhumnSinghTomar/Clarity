import { getCurrentWeekStart } from "../../controllers/getCurrentWeekStart.js";
import prisma from "../../prismaClient.js";

function weekdayName(weekday: number) {
  return [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ][weekday];
}

export async function getWeeklyStudyHours(userId: string, page: number) {
  const currentWeekStart = getCurrentWeekStart(new Date());

  /**
   * 1. Fetch ONLY weeks that actually exist in DB
   */

  console.log("userId:", userId);
  console.log("page param:", page);
  console.log("currentWeekStart (ISO):", currentWeekStart.toISOString());

  const studiedWeeks = await prisma.weeklyStudyHours.findMany({
    where: { userId },
    orderBy: { weekStart: "desc" },
  });

  console.log("studiedWeeks count:", studiedWeeks.length);
  console.log(
    "studiedWeeks weekStart samples:",
    studiedWeeks.map((w) => w.weekStart),
  );

  /**
   * 2. Inject current week if missing (NO day filling)
   */
  const hasCurrentWeek = studiedWeeks.some(
    (w) => w.weekStart.toISOString() === currentWeekStart.toISOString(),
  );

  const weeks = hasCurrentWeek
    ? studiedWeeks
    : [
        {
          id: "virtual-current-week",
          userId,
          weekStart: currentWeekStart,
          days: [], // ← frontend will handle weekday gaps
          totalSec: 0,
          createdAt: new Date(currentWeekStart),
          updatedAt: new Date(currentWeekStart),
        },
        ...studiedWeeks,
      ];

  /**
   * 3. Pagination
   */
  if (page < 0 || page >= weeks.length) {
    return null;
  }

  const currentWeek = weeks[page];
  if (!currentWeek) {
    return null;
  }
  const previousWeek = weeks[page + 1] ?? null;

  /**
   * 4. Compute best & lowest focus days FROM STORED DAYS ONLY
   */

  let bestDay = null;
  let lowestFocusDay = null;

  for (const d of currentWeek.days) {
    if (!bestDay || d.focusedSec > bestDay.focusedSec) {
      bestDay = {
        weekday: d.weekday,
        day: weekdayName(d.weekday),
        focusedSec: d.focusedSec,
        minutes: Math.round(d.focusedSec / 60),
      };
    }

    if (
      d.focusedSec > 0 &&
      (!lowestFocusDay || d.focusedSec < lowestFocusDay.focusedSec)
    ) {
      lowestFocusDay = {
        weekday: d.weekday,
        day: weekdayName(d.weekday),
        focusedSec: d.focusedSec,
        minutes: Math.round(d.focusedSec / 60),
      };
    }
  }

  /**
   * 5. Week-over-week comparison
   * Previous week = previous STUDIED week (not calendar-continuous)
   */
  let weekOverWeekPercent = null;

  if (previousWeek && previousWeek.totalSec > 0) {
    weekOverWeekPercent =
      ((currentWeek.totalSec - previousWeek.totalSec) / previousWeek.totalSec) *
      100;
  }

  /**
   * 6. Final payload (frontend-ready)
   */
  return {
    weekStart: currentWeek.weekStart,
    days: currentWeek.days,
    totalSec: currentWeek.totalSec,

    meta: {
      weekOverWeekPercent,
      bestDay,
      lowestFocusDay,
    },
  };
}
