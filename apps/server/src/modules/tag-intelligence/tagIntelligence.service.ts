import prisma from "../../prismaClient.js";
import { getCurrentWeekStart } from "../../controllers/getCurrentWeekStart.js";

type TimePerTagEntry = {
  tag: string;
  totalDurationSec: number;
  sessionCount: number;
};

type WeeklyBreakdownEntry = {
  tag: string;
  sessions: number;
  avgSessionDurationSec: number;
  totalDurationSec: number;
};

function getWeekWindow(page: number) {
  const currentWeekStart = getCurrentWeekStart(new Date());
  const weekStart = new Date(currentWeekStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - page * 7);

  // Keep analytics weekly: every page maps to one Monday→Sunday style week window.
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  return {
    weekStart,
    weekEnd,
  };
}

async function getWeeklyTagSessions(userId: string, page: number) {
  const { weekStart, weekEnd } = getWeekWindow(page);

  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startTime: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
    select: {
      tag: true,
      durationSec: true,
    },
  });

  return {
    sessions,
    weekStart,
    weekEnd,
  };
}

export async function getWeeklyTimePerTag(userId: string, page: number) {
  const { sessions, weekStart, weekEnd } = await getWeeklyTagSessions(userId, page);
  const tagMap = new Map<string, TimePerTagEntry>();

  for (const session of sessions) {
    const tag = session.tag?.trim() || "untagged";
    const existing = tagMap.get(tag);

    if (!existing) {
      tagMap.set(tag, {
        tag,
        totalDurationSec: session.durationSec,
        sessionCount: 1,
      });
      continue;
    }

    existing.totalDurationSec += session.durationSec;
    existing.sessionCount += 1;
  }

  const data = Array.from(tagMap.values()).sort(
    (a, b) => b.totalDurationSec - a.totalDurationSec,
  );

  return {
    week: {
      page,
      weekStart,
      weekEnd,
    },
    data,
  };
}

export async function getWeeklyBreakdownByTag(userId: string, page: number) {
  const { sessions, weekStart, weekEnd } = await getWeeklyTagSessions(userId, page);
  const tagMap = new Map<string, { totalDurationSec: number; sessions: number }>();

  for (const session of sessions) {
    const tag = session.tag?.trim() || "untagged";
    const existing = tagMap.get(tag);

    if (!existing) {
      tagMap.set(tag, {
        totalDurationSec: session.durationSec,
        sessions: 1,
      });
      continue;
    }

    existing.totalDurationSec += session.durationSec;
    existing.sessions += 1;
  }

  const data: WeeklyBreakdownEntry[] = Array.from(tagMap.entries())
    .map(([tag, values]) => ({
      tag,
      sessions: values.sessions,
      avgSessionDurationSec: Math.round(values.totalDurationSec / values.sessions),
      totalDurationSec: values.totalDurationSec,
    }))
    .sort((a, b) => b.totalDurationSec - a.totalDurationSec);

  return {
    week: {
      page,
      weekStart,
      weekEnd,
    },
    data,
  };
}
