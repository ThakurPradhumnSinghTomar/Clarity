import { getCurrentWeekStart } from "../../controllers/getCurrentWeekStart.js";
import prisma from "../../prismaClient.js";

const DAYS_FOR_AVERAGES = 7;
const WEEKS_FOR_CONSISTENCY = 4;
const DEEP_FOCUS_THRESHOLD_SEC = 25 * 60;

function toUtcDayKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getAnalyticsOverview(userId: string) {
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);

  const rangeStart = new Date(todayUtc);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - (DAYS_FOR_AVERAGES - 1));

  const focusSessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startTime: {
        gte: rangeStart,
      },
    },
    select: {
      startTime: true,
      durationSec: true,
    },
  });

  let totalDurationSec = 0;
  let deepFocusSessions = 0;
  const dailyTotals = new Map<string, number>();

  for (const session of focusSessions) {
    totalDurationSec += session.durationSec;

    if (session.durationSec > DEEP_FOCUS_THRESHOLD_SEC) {
      deepFocusSessions += 1;
    }

    const dayKey = toUtcDayKey(session.startTime);
    dailyTotals.set(
      dayKey,
      (dailyTotals.get(dayKey) ?? 0) + session.durationSec,
    );
  }

  const activeDays = dailyTotals.size;
  const sessionCount = focusSessions.length;

  const avgDailyTimeMin = activeDays
    ? Math.round(totalDurationSec / activeDays / 60)
    : 0;

  const avgSessionLengthMin = sessionCount
    ? Math.round(totalDurationSec / sessionCount / 60)
    : 0;

  const deepFocusRatio = sessionCount
    ? Math.round((deepFocusSessions / sessionCount) * 100)
    : 0;

  const currentWeekStart = getCurrentWeekStart(new Date());
  const consistencyRangeStart = new Date(currentWeekStart);
  consistencyRangeStart.setUTCDate(
    consistencyRangeStart.getUTCDate() -
      (WEEKS_FOR_CONSISTENCY - 1) * 7,
  );

  const weeklyStudyHours = await prisma.weeklyStudyHours.findMany({
    where: {
      userId,
      weekStart: {
        gte: consistencyRangeStart,
      },
    },
    select: {
      weekStart: true,
      days: true,
    },
  });

  const normalizeWeekStart = (date: Date) =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  const weeklyMap = new Map<number, { days: { focusedSec: number }[] }>();
  for (const week of weeklyStudyHours) {
    const key = normalizeWeekStart(week.weekStart);
    weeklyMap.set(key, { days: week.days });
  }

  let totalActiveDays = 0;
  for (let i = 0; i < WEEKS_FOR_CONSISTENCY; i += 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - i * 7);
    const weekKey = normalizeWeekStart(weekStart);
    const week = weeklyMap.get(weekKey);

    if (!week) {
      continue;
    }

    totalActiveDays += week.days.filter((d) => d.focusedSec > 0).length;
  }

  const avgActiveDays = totalActiveDays / WEEKS_FOR_CONSISTENCY;
  const consistencyScore = Math.round((avgActiveDays / 7) * 100);

  return {
    avgDailyTimeMin,
    avgSessionLengthMin,
    deepFocusRatio,
    consistencyScore,
  };
}
