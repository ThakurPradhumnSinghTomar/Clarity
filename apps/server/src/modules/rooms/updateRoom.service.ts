import prisma from "../../prismaClient.js";

type UpdateRoomInput = {
  roomId: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  membersToRemove: string[];
};

export async function updateRoomService({
  roomId,
  userId,
  name,
  description,
  isPublic,
  membersToRemove,
}: UpdateRoomInput) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { hostId: true },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  if (room.hostId !== userId) {
    throw new Error("NOT_ROOM_HOST");
  }

  await prisma.$transaction([
    // remove members
    prisma.roomMember.deleteMany({
      where: {
        roomId,
        userId: { in: membersToRemove },
      },
    }),

    // update room meta
    prisma.room.update({
      where: { id: roomId },
      data: {
        name,
        description,
        isPublic,
      },
    }),
  ]);

  return true;
}
