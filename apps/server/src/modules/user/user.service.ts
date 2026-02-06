import prisma from "../../prismaClient.js";

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      focusSessions: {
        select: { durationSec: true },
      },
    },
  });
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; image?: string },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function updateUserPing(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      lastPing: new Date(),
    },
  });
}

export async function updateUserFocusing(
  userId: string,
  isFocusing: boolean,
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isFocusing,
    },
  });
}
