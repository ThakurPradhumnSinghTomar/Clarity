import prisma from "../../prismaClient.js";
import { generateRoomCode } from "../../controllers/generateRandomNumber.js";
import { getCurrentWeekStart } from "../../controllers/getCurrentWeekStart.js";
import { isUserFocusing } from "./room.utils.js";

type CreateRoomInput = {
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
};

export async function createRoom({
  userId,
  name,
  description,
  isPublic,
}: CreateRoomInput) {
  const roomCode = await generateRoomCode();

  return prisma.room.create({
    data: {
      name,
      description: description ?? null,
      roomCode,
      isPublic,
      hostId: userId,
    },
  });
}

export async function getMyRooms(userId: string) {
  const rooms = await prisma.room.findMany({
    where: {
      OR: [
        { hostId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          lastPing: true,
          isFocusing: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              lastPing: true,
              isFocusing: true,
            },
          },
        },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  return rooms.map((room) => {
    let focusingCount = 0;

    // host
    if (isUserFocusing(room.host.isFocusing, room.host.lastPing)) {
      focusingCount += 1;
    }

    // members
    for (const member of room.members) {
      if (
        isUserFocusing(
          member.user.isFocusing,
          member.user.lastPing,
        )
      ) {
        focusingCount += 1;
      }
    }

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      roomCode: room.roomCode,
      isPublic: room.isPublic,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,

      host: room.host,
      memberCount: room._count.members,
      focusingCount,
    };
  });
}


export async function joinRoomService(
  userId: string,
  roomCode: string,
) {
  const room = await prisma.room.findUnique({
    where: { roomCode },
    include: {
      host: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  if (room.hostId === userId) {
    throw new Error("HOST_CANNOT_JOIN");
  }

  const existingMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId: room.id,
      },
    },
  });

  if (existingMember) {
    throw new Error("ALREADY_MEMBER");
  }

  // 🔒 PRIVATE ROOM FLOW
  if (!room.isPublic) {
    const existingRequest = await prisma.joinRequest.findUnique({
      where: {
        userId_roomId_joinRequest: {
          userId,
          roomId: room.id,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        throw new Error("REQUEST_ALREADY_PENDING");
      }

      if (existingRequest.status === "REJECTED") {
        const updated = await prisma.joinRequest.update({
          where: {
            userId_roomId_joinRequest: {
              userId,
              roomId: room.id,
            },
          },
          data: { status: "pending" },
        });

        return {
          type: "REQUEST_RESENT",
          joinRequest: updated,
        };
      }
    }

    const joinRequest = await prisma.joinRequest.create({
      data: {
        userId,
        roomId: room.id,
        status: "pending",
      },
    });

    return {
      type: "REQUEST_CREATED",
      joinRequest,
    };
  }

  // 🌍 PUBLIC ROOM FLOW
  const roomMember = await prisma.roomMember.create({
    data: {
      userId,
      roomId: room.id,
      role: "member",
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      room: {
        select: {
          id: true,
          name: true,
          roomCode: true,
          isPublic: true,
        },
      },
    },
  });

  return {
    type: "JOINED",
    roomMember,
    room: {
      id: room.id,
      name: room.name,
      description: room.description,
      roomCode: room.roomCode,
      isPublic: room.isPublic,
      memberCount: room._count.members + 1,
      host: room.host,
    },
  };
}


export async function getRoomDetailsService(
  roomId: string,
  userId: string,
) {
  const currentWeekStart = getCurrentWeekStart(new Date());

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          lastPing: true,
          isFocusing: true,
          weeklyStudyHours: {
            where: { weekStart: currentWeekStart },
            orderBy: { weekStart: "desc" },
            take: 1,
            select: { totalSec: true },
          },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              lastPing: true,
              isFocusing: true,
              weeklyStudyHours: {
                where: { weekStart: currentWeekStart },
                orderBy: { weekStart: "desc" },
                take: 1,
                select: { totalSec: true },
              },
            },
          },
        },
      },
      joinRequests: {
        include: {
          user: {
            select: { name: true, image: true },
          },
          room: {
            select: { roomCode: true },
          },
        },
      },
    },
  });

  if (!room) throw new Error("ROOM_NOT_FOUND");

  const isHost = room.hostId === userId;
  const isMember = room.members.some((m) => m.userId === userId);

  if (!isHost && !isMember) {
    throw new Error("NOT_A_MEMBER");
  }

  /* ===================== Build members ===================== */

  const members = room.members.map((member) => {
    const weekly = member.user.weeklyStudyHours[0];
    const studySec = weekly?.totalSec ?? 0;

    return {
      id: member.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.image || "👤",
      isFocusing: isUserFocusing(
        member.user.isFocusing,
        member.user.lastPing,
      ),
      studyTime: Math.floor(studySec / 60),
      joinedAt: member.joinedAt,
      role: member.role,
    };
  });

  /* ===================== Host as member ===================== */

  const hostWeekly = room.host.weeklyStudyHours[0];
  const hostStudySec = hostWeekly?.totalSec ?? 0;

  members.push({
    id: `host-${room.host.id}`,
    userId: room.host.id,
    name: room.host.name,
    email: room.host.email,
    avatar: room.host.image || "👑",
    isFocusing: isUserFocusing(
      room.host.isFocusing,
      room.host.lastPing,
    ),
    studyTime: Math.floor(hostStudySec / 60),
    joinedAt: room.createdAt,
    role: "host",
  });

  /* ===================== Ranking ===================== */

  const sorted = [...members].sort(
    (a, b) => b.studyTime - a.studyTime,
  );

  const membersWithRanks = members.map((m) => ({
    ...m,
    rank: sorted.findIndex((x) => x.id === m.id) + 1,
  }));

  const totalStudyTime = membersWithRanks.reduce(
    (sum, m) => sum + m.studyTime,
    0,
  );

  return {
    room: {
      id: room.id,
      name: room.name,
      description: room.description,
      roomCode: room.roomCode,
      isPublic: room.isPublic,
      hostId: room.hostId,
      isHost,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberCount: membersWithRanks.length,
      totalStudyTime,
      members: membersWithRanks,
      joinRequests: room.joinRequests,
    },
  };
}

export async function approveJoinRequestService(
  hostId: string,
  roomId: string,
  requestUserId: string,
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { hostId: true },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  if (room.hostId !== hostId) {
    throw new Error("NOT_ROOM_HOST");
  }

  const joinRequest = await prisma.joinRequest.findUnique({
    where: {
      userId_roomId_joinRequest: {
        userId: requestUserId,
        roomId,
      },
    },
  });

  if (!joinRequest) {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (joinRequest.status !== "pending") {
    throw new Error("REQUEST_NOT_PENDING");
  }

  const existingMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: requestUserId,
        roomId,
      },
    },
  });

  if (existingMember) {
    throw new Error("ALREADY_MEMBER");
  }

  // 🔒 ATOMIC OPERATION
  const result = await prisma.$transaction(async (tx) => {
    const roomMember = await tx.roomMember.create({
      data: {
        userId: requestUserId,
        roomId,
        role: "member",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    await tx.joinRequest.delete({
      where: {
        userId_roomId_joinRequest: {
          userId: requestUserId,
          roomId,
        },
      },
    });

    return roomMember;
  });

  return result;
}


export async function rejectJoinRequestService(
  hostId: string,
  roomId: string,
  requestUserId: string,
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { hostId: true },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  if (room.hostId !== hostId) {
    throw new Error("NOT_ROOM_HOST");
  }

  const joinRequest = await prisma.joinRequest.findUnique({
    where: {
      userId_roomId_joinRequest: {
        userId: requestUserId,
        roomId,
      },
    },
  });

  if (!joinRequest) {
    throw new Error("REQUEST_NOT_FOUND");
  }

  if (joinRequest.status !== "pending") {
    throw new Error("REQUEST_NOT_PENDING");
  }

  const updatedRequest = await prisma.joinRequest.update({
    where: {
      userId_roomId_joinRequest: {
        userId: requestUserId,
        roomId,
      },
    },
    data: {
      status: "REJECTED",
    },
  });

  return updatedRequest;
}
