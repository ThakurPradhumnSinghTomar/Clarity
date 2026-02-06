import prisma from "../../prismaClient.js";

export async function getUserTags(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tags: true },
  });

  return user?.tags ?? [];
}

export async function createUserTag(userId: string, tag: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tags: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.tags?.includes(tag)) {
    const err = new Error("Tag already exists");
    // @ts-expect-error custom error
    err.code = "TAG_EXISTS";
    throw err;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      tags: {
        push: tag,
      },
    },
  });

  return tag;
}
