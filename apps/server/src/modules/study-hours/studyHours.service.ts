import prisma from "../../prismaClient.js";

export async function getWeeklyStudyHours(
  userId: string,
  page: number,
) {
  const data = await prisma.weeklyStudyHours.findMany({
    where: {
      userId,
    },
    orderBy: {
      weekStart: "desc",
    },
    skip: page,
    take: 1,
  });

  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
}
