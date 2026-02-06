import prisma from "../../prismaClient.js";

export async function deleteOrLeaveRoomService(
  userId: string,
  roomId: string,
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      hostId: true,
    },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // ✅ Host → delete entire room
  if (room.hostId === userId) {
    await prisma.room.delete({
      where: { id: roomId },
    });

    return { action: "ROOM_DELETED" };
  }

  // ✅ Member → leave room
  const membership = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });

  if (!membership) {
    throw new Error("NOT_A_MEMBER");
  }

  await prisma.roomMember.delete({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });

  return { action: "LEFT_ROOM" };
}
