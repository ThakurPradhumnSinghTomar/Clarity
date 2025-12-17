const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 1;

const skip = (page - 1) * limit;

const data = await prisma.weeklyStudyHours.findMany({
  where: {
    userId: userId,
  },
  orderBy: {
    weekStart: "desc",
  },
  skip,
  take: limit,
});
