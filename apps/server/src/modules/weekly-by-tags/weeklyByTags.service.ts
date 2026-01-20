import prisma from "../../prismaClient.js";
import { getCurrentWeekStart } from "../../controllers/getCurrentWeekStart.js";

type FocusSession = {
  startTime: Date;
  durationSec: number;
  tag: string | null;
};

type DayGroup = {
  sessions: FocusSession[];
  totalDuration: number;
};

type TagGroup = {
  totalDuration: number;
  byDay: DayGroup[];
};

function getPreviousWeekStart(currentWeekStart: Date, weeksAgo = 1) {
  const d = new Date(currentWeekStart);
  d.setDate(d.getDate() - weeksAgo * 7);
  return d;
}

export async function getWeeklyStudyHoursByTags(
  userId: string,
  page: number,
) {
  const currentWeekStart = getCurrentWeekStart(new Date());
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

  const sessionByTag: Record<string, TagGroup> = {};
  let weeklyTotalDuration = 0;

  for (const s of focusSessions) {
    const tag = s.tag ?? "untagged";

    if (!sessionByTag[tag]) {
      sessionByTag[tag] = {
        totalDuration: 0,
        byDay: Array.from({ length: 7 }, () => ({
          sessions: [],
          totalDuration: 0,
        })),
      };
    }

    // JS: Sun=0 → Mon=0
    const dayIndex = (s.startTime.getUTCDay() + 6) % 7;

    sessionByTag[tag]!.byDay[dayIndex]!.sessions.push(s);
    sessionByTag[tag]!.byDay[dayIndex]!.totalDuration += s.durationSec;

    sessionByTag[tag].totalDuration += s.durationSec;
    weeklyTotalDuration += s.durationSec;
  }

  return {
    week: {
      gte,
      lte,
      totalDuration: weeklyTotalDuration,
    },
    data: sessionByTag,
  };
}
