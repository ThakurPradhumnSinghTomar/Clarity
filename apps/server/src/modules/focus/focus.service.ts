import prisma from "../../prismaClient.js";

function getWeekStartUTC(date: Date) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);

  return d;
}

export async function saveFocusSession({
  userId,
  startTime,
  endTime,
  durationSec,
  tag,
  note,
}: {
  userId: string;
  startTime: Date;
  endTime: Date;
  durationSec: number;
  tag?: string | null;
  note?: string | null;
}) {
  const focusSession = await prisma.focusSession.create({
    data: {
      userId,
      startTime,
      endTime,
      durationSec,

      ...(tag !== undefined && { tag }),
      ...(note !== undefined && { note }),
    },
  });

  const weekStart = getWeekStartUTC(startTime);
  const weekday = (startTime.getUTCDay() + 6) % 7;

  let weeklyRecord = await prisma.weeklyStudyHours.findFirst({
    where: { userId, weekStart },
  });

  if (!weeklyRecord) {
    weeklyRecord = await prisma.weeklyStudyHours.create({
      data: {
        userId,
        weekStart,
        days: [{ weekday, focusedSec: durationSec }],
        totalSec: durationSec,
      },
    });
  } else {
    const days = weeklyRecord.days;
    const existing = days.find((d) => d.weekday === weekday);

    const updatedDays = existing
      ? days.map((d) =>
          d.weekday === weekday
            ? { ...d, focusedSec: d.focusedSec + durationSec }
            : d,
        )
      : [...days, { weekday, focusedSec: durationSec }];

    weeklyRecord = await prisma.weeklyStudyHours.update({
      where: { id: weeklyRecord.id },
      data: {
        days: updatedDays,
        totalSec: updatedDays.reduce((s, d) => s + d.focusedSec, 0),
      },
    });
  }

  return { focusSession, weeklyRecord };
}

export async function getRecentFocusSessions(userId: string) {
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfPastDays = new Date(startOfToday);
  startOfPastDays.setDate(startOfPastDays.getDate() - 1);

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

  const today = [];
  const pastSessions = [];

  for (const session of sessions) {
    if (session.startTime >= startOfToday) {
      today.push(session);
    } else {
      pastSessions.push(session);
    }
  }

  return {
    today,
    pastSessions,
  };
}
