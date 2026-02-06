import prisma from "../../prismaClient.js";

const WEEKS = 8;
const DAYS_IN_WEEK = 7;

function getWeekStartUTC(date: Date) {
  const d = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );

  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);

  return d;
}

export async function getHeatmapData(userId: string) {
  // 🔒 canonical week start
  const currWeekStart = getWeekStartUTC(new Date());

  // 🔒 today at 00:00 UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  /* ===================== Generate week starts ===================== */

  const weekStarts: Date[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const d = new Date(currWeekStart);
    d.setUTCDate(d.getUTCDate() - i * DAYS_IN_WEEK);
    weekStarts.push(d);
  }

  const rangeStart = weekStarts[0];
  if (!rangeStart) {
    throw new Error("weekStarts generation failed");
  }

  /* ===================== Fetch DB data ===================== */

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
    orderBy: {
      weekStart: "asc",
    },
  });

  /* ===================== Normalize DB weeks ===================== */

  const normalizeWeekStart = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

  const dbWeekMap = new Map<number, { days: any[] }>();

  for (const w of weeklyStudyHours) {
    const key = normalizeWeekStart(w.weekStart);

    if (!dbWeekMap.has(key)) {
      dbWeekMap.set(key, { days: [...w.days] });
    } else {
      // merge old bad duplicated data safely
      dbWeekMap.get(key)!.days.push(...w.days);
    }
  }

  /* ===================== Build heatmap ===================== */

  const finalWeekData: Record<number, number[]> = {};

  weekStarts.forEach((weekStart, index) => {
    const daysWiseStudy = Array(7).fill(0);

    const key = normalizeWeekStart(weekStart);
    const dbWeek = dbWeekMap.get(key);

    if (dbWeek) {
      for (const day of dbWeek.days) {
        daysWiseStudy[day.weekday] += day.focusedSec;
      }
    }

    // 🔒 trim current week till today
    if (key === normalizeWeekStart(currWeekStart)) {
      const diffDays =
        Math.floor(
          (today.getTime() - weekStart.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;

      daysWiseStudy.length = Math.min(diffDays, 7);
    }

    finalWeekData[index] = daysWiseStudy;
  });

  return finalWeekData;
}
