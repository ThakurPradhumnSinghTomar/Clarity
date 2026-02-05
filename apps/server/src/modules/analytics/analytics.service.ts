import { getCurrentWeekStart } from "../../controllers/getCurrentWeekStart.js";
import prisma from "../../prismaClient.js";

const DAYS_FOR_AVERAGES = 7;
const WEEKS_FOR_CONSISTENCY = 4;
const DEEP_FOCUS_THRESHOLD_SEC = 25 * 60;
const FOCUS_INSIGHTS_RANGE_DAYS = 7;
const DEEP_FOCUS_SESSION_THRESHOLD_SEC = 45 * 60;
const EARLY_BREAK_THRESHOLD_SEC = 25 * 60;

type FocusWindow = "Morning" | "Afternoon" | "Evening" | "Night";

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
    consistencyRangeStart.getUTCDate() - (WEEKS_FOR_CONSISTENCY - 1) * 7,
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

function getFocusWindowLabel(hourUtc: number): FocusWindow {
  if (hourUtc >= 6 && hourUtc < 12) {
    return "Morning";
  }

  if (hourUtc >= 12 && hourUtc < 17) {
    return "Afternoon";
  }

  if (hourUtc >= 17 && hourUtc < 22) {
    return "Evening";
  }

  return "Night";
}

export async function getFocusInsights(userId: string) {
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setUTCDate(
    rangeStart.getUTCDate() - (FOCUS_INSIGHTS_RANGE_DAYS - 1),
  );
  rangeStart.setUTCHours(0, 0, 0, 0);

  const sessions = await prisma.focusSession.findMany({
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
    orderBy: {
      startTime: "asc",
    },
  });

  const totalSessions = sessions.length;
  const totalDurationSec = sessions.reduce(
    (sum, session) => sum + session.durationSec,
    0,
  );
  const deepFocusSessions = sessions.filter(
    (session) => session.durationSec >= DEEP_FOCUS_SESSION_THRESHOLD_SEC,
  ).length;
  const earlyBreakCount = sessions.filter(
    (session) => session.durationSec < EARLY_BREAK_THRESHOLD_SEC,
  ).length;

  const focusWindowDurations: Record<FocusWindow, number> = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    Night: 0,
  };

  for (const session of sessions) {
    const focusWindow = getFocusWindowLabel(session.startTime.getUTCHours());
    focusWindowDurations[focusWindow] += session.durationSec;
  }

  const bestFocusWindow =
    Object.entries(focusWindowDurations).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "Morning";

  const sessionBuckets = [
    { range: "0–15 min", minSec: 0, maxSec: 15 * 60, count: 0 },
    { range: "15–30 min", minSec: 15 * 60, maxSec: 30 * 60, count: 0 },
    { range: "30–45 min", minSec: 30 * 60, maxSec: 45 * 60, count: 0 },
    { range: "45–60 min", minSec: 45 * 60, maxSec: 60 * 60, count: 0 },
    {
      range: "60+ min",
      minSec: 60 * 60,
      maxSec: Number.POSITIVE_INFINITY,
      count: 0,
    },
  ];

  for (const session of sessions) {
    const bucket = sessionBuckets.find(
      (entry) =>
        session.durationSec >= entry.minSec &&
        session.durationSec < entry.maxSec,
    );
    if (bucket) {
      bucket.count += 1;
    }
  }

  const breakSensitivityBuckets = sessionBuckets.filter(
    (bucket) => bucket.range === "15–30 min" || bucket.range === "30–45 min",
  );
  const dropOffBucket =
    breakSensitivityBuckets.sort((a, b) => b.count - a.count)[0]?.range ??
    "15–30 min";

  return {
    focusStats: {
      deepFocusSessions,
      avgSessionLengthMin:
        totalSessions > 0
          ? Math.round(totalDurationSec / totalSessions / 60)
          : 0,
      bestFocusWindow,
      breakRate:
        totalSessions > 0
          ? Math.round((earlyBreakCount / totalSessions) * 100)
          : 0,
    },
    sessionBuckets: sessionBuckets.map(({ range, count }) => ({
      range,
      count,
    })),
    breakPatternInsight: {
      headline: `🚀 You perform best in the ${bestFocusWindow.toLowerCase()}.`,
      description:
        totalSessions > 0
          ? `Most sessions break around the ${dropOffBucket} mark. Try taking a quick reset break before that drop-off.`
          : "Complete a few focus sessions to unlock break pattern insights.",
    },
  };
}
