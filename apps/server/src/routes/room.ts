import express from "express";
import prisma from "../prismaClient.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { generateRoomCode } from "../controllers/generateRandomNumber.js";
import { error } from "node:console";

const roomRouter = express.Router();

roomRouter.get("/", (req, res) => {
  return res
    .status(201)
    .json({ success: "true", message: "room router is running..." });
});

roomRouter.post("/create-room", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - please login",
      });
    }

    const { name, description, isPublic } = req.body; // No roomCode needed!

    // Proper validation
    if (!name || isPublic === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, isPublic)",
      });
    }

    // Generate unique room code
    const roomCode = await generateRoomCode();

    const room = await prisma.room.create({
      data: {
        name: name,
        description: description || null,
        roomCode: roomCode, // Auto-generated code
        isPublic: isPublic,
        hostId: userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Successfully created room",
      room,
    });
  } catch (error: any) {
    console.error("Error creating room:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating room",
      error: error.message,
    });
  }
});

roomRouter.get("/get-my-rooms", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - please login",
      });
    }

    // Get rooms where user is host OR a participant
    const myRooms = await prisma.room.findMany({
      where: {
        OR: [
          { hostId: userId }, // Rooms I created
          {
            members: {
              // Rooms I joined (if you have this relation)
              some: {
                userId: userId,
              },
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
          },
        },
        // Include participant count if needed
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Successfully fetched your rooms",
      rooms: myRooms,
      count: myRooms.length,
    });
  } catch (error: any) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching rooms",
      error: error.message,
    });
  }
});

roomRouter.post("/approve-joinroom-req", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { roomCode, roomId, RequserId } = req.body;

    if (!RequserId) {
      return res.status(401).json({
        success: "false",
        message: "provide the user id of user that made this request of room join",
      });
    }

    if (!roomCode) {
      return res
        .status(400)
        .json({ success: "false", message: "please provide room code" });
    }

    const existingMember = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: RequserId,
          roomId: roomId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this room",
      });
    }

    const roomMember = await prisma.roomMember.create({
      //include statements are only for returning data, nothing contributing in creation
      data: {
        userId: RequserId,
        roomId: roomId,
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

    return res.status(200).json({
      success: true,
      message: "user successfully joined the room!",
      roomMember: roomMember,
    });
  } catch (error: any) {
    console.error("Error joining room:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while accepting joining room request of this user..",
      error: error.message,
    });
  }
});

roomRouter.patch("/join-room", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { roomCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: "false",
        message: "user is not authenticated, no userid in request",
      });
    }

    if (!roomCode) {
      return res
        .status(400)
        .json({ success: "false", message: "please provide room code" });
    }

    //find the room user want to join
    const room = await prisma.room.findUnique({
      where: {
        roomCode: roomCode,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found. Please check the room code.",
      });
    }

    if (room.hostId === userId) {
      return res.status(400).json({
        success: false,
        message: "You are the host of this room. You cannot join as a member.",
      });
    }

    const existingMember = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: userId,
          roomId: room.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this room",
      });
    }

    //two paths, wether joining a private room, or a public room

    //if joining a public room join directly without creating a reqeust to host

    //but if joining in a private room, just create a pending request instead of joining a room, host will deciede it..
    if (!room.isPublic) {
      //check krlo khin phle se ho to req nhi daal rakhi h
      const existingRequest = await prisma.joinRequest.findUnique({
        //userId_roomId_joinRequest is the index we defined in the schema . prisma of this model
        where: {
          userId_roomId_joinRequest: {
            userId: userId,
            roomId: room.id,
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === "pending") {
          return res.status(400).json({
            success: false,
            message: "You already have a pending join request for this room",
          });
        } else if (existingRequest.status === "rejected") {
          return res.status(403).json({
            success: false,
            message:
              "Your join request was rejected. Please contact the room host.",
          });
        }
      }

      // Create join request for private room
      const joinRequest = await prisma.joinRequest.create({
        data: {
          userId: userId,
          roomId: room.id,
          status: "pending",
        },
      });

      return res.status(200).json({
        success: true,
        message:
          "Join request sent to the room host. You'll be notified once approved.",
        joinRequest: joinRequest,
      });
    }

    // If room is public, directly add user as member
    const roomMember = await prisma.roomMember.create({
      //include statements are only for returning data, nothing contributing in creation
      data: {
        userId: userId,
        roomId: room.id,
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

    return res.status(200).json({
      success: true,
      message: "Successfully joined the room!",
      roomMember: roomMember,
      room: {
        id: room.id,
        name: room.name,
        description: room.description,
        roomCode: room.roomCode,
        isPublic: room.isPublic,
        memberCount: room._count.members + 1, // +1 for the new member
        host: room.host,
      },
    });
  } catch (error: any) {
    console.error("Error joining room:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while joining room",
      error: error.message,
    });
  }
});

roomRouter.get("/get-room/:roomId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const roomId = req.params.roomId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Please provide roomId",
      });
    }

    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isFocusing: true,
            weeklyStudyHours: {
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
                isFocusing: true,
                weeklyStudyHours: {
                  orderBy: {
                    weekStart: "desc",
                  },
                  take: 1, // Only get latest week
                  select: {
                    totalSec: true,
                  },
                },
              },
            },
          },
        },

        joinRequests: {
          include: {
            room: {
              select: {
                roomCode: true,
              },
            },
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Verify user is member or host
    const isMember = room.members.some((m) => m.userId === userId);
    const isHost = room.hostId === userId;

    if (!isMember && !isHost) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room",
      });
    }

    // Transform members data
    const membersWithStats = room.members.map((member) => {
      const weeklyHours = member.user.weeklyStudyHours[0];
      const studyTimeSeconds = weeklyHours?.totalSec || 0;

      return {
        id: member.id,
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.image || "👤", // Default avatar
        isFocusing: member.user.isFocusing || false,
        studyTime: Math.floor(studyTimeSeconds / 60), // Convert to minutes
        joinedAt: member.joinedAt,
        role: member.role,
      };
    });

    const hostWeekly = room.host.weeklyStudyHours[0];
    const hostStudySeconds = hostWeekly?.totalSec || 0;

    const hostAsMember = {
      id: `host-${room.host.id}`,
      userId: room.host.id,
      name: room.host.name,
      email: room.host.email,
      avatar: room.host.image || "👑",
      isFocusing: room.host.isFocusing || false,
      studyTime: Math.floor(hostStudySeconds / 60),
      joinedAt: room.createdAt,
      role: "host",
    };

    membersWithStats.push(hostAsMember);

    // Sort by study time to calculate ranks
    const sortedMembers = [...membersWithStats].sort(
      (a, b) => b.studyTime - a.studyTime
    );

    // Add ranks
    const membersWithRanks = membersWithStats.map((member) => {
      const rank = sortedMembers.findIndex((m) => m.id === member.id) + 1;
      return { ...member, rank };
    });

    // Calculate total study time
    const totalStudyTime = membersWithStats.reduce(
      (sum, m) => sum + m.studyTime,
      0
    );

    // Build response
    const responseData = {
      id: room.id,
      name: room.name,
      description: room.description,
      roomCode: room.roomCode,
      isPublic: room.isPublic,
      isHost: isHost,
      memberCount: room.members.length,
      totalStudyTime: totalStudyTime,
      host: room.host,
      members: membersWithRanks,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      joinRequests: room.joinRequests,
    };

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      room: responseData,
    });
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching room",
      error: error.message,
    });
  }
});

roomRouter.delete("/leave-room/:roomId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const roomId = req.params.roomId;
    const { isHost, roomCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Please provide roomId",
      });
    }

    if (isHost) {
      const room = await prisma.room.delete({
        where: {
          roomCode: roomCode,
        },
      });

      if (!room) {
        return res
          .status(500)
          .json({ success: "failed", message: "failed to delete the room..." });
      }

      return res.status(201).json({
        success: "true",
        message: "successfully deleted the room...",
        room,
      });
    }

    const roomMember = await prisma.roomMember.delete({
      where: {
        userId_roomId: {
          userId: userId,
          roomId: roomId,
        },
      },
    });

    if (!roomMember) {
      return res
        .status(500)
        .json({ success: "failed", message: "failed to leave the room..." });
    }

    return res.status(201).json({
      success: "true",
      message: "successfully leaved the room...",
      roomMember,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: "failed", message: "failed to leave the room..." });
  }
});

export default roomRouter;
