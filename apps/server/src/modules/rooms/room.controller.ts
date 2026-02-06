import type { Request, Response } from "express";
import { createRoom, getMyRooms, getRoomDetailsService, joinRoomService, rejectJoinRequestService } from "./room.service.js";

export async function createRoomController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.id;
    const { name, description, isPublic } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!name || typeof isPublic !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "name and isPublic are required",
      });
    }

    const room = await createRoom({
      userId,
      name,
      description,
      isPublic,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create room",
    });
  }
}



export async function getMyRoomsController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const rooms = await getMyRooms(userId);

    return res.status(200).json({
      success: true,
      message: "Successfully fetched your rooms",
      rooms,
      count: rooms.length,
    });
  } catch (error) {
    console.error("Get my rooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
    });
  }
}


export async function joinRoomController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.id;
    const { roomCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        message: "Please provide room code",
      });
    }

    const result = await joinRoomService(userId, roomCode);

    switch (result.type) {
      case "REQUEST_CREATED":
        return res.status(200).json({
          success: true,
          message:
            "Join request sent to the room host. You'll be notified once approved.",
          joinRequest: result.joinRequest,
        });

      case "REQUEST_RESENT":
        return res.status(200).json({
          success: true,
          message:
            "Join request re-sent to the room host. You'll be notified once approved.",
          joinRequest: result.joinRequest,
        });

      case "JOINED":
        return res.status(200).json({
          success: true,
          message: "Successfully joined the room!",
          roomMember: result.roomMember,
          room: result.room,
        });
    }
  } catch (error: any) {
    const map: Record<string, number> = {
      ROOM_NOT_FOUND: 404,
      HOST_CANNOT_JOIN: 400,
      ALREADY_MEMBER: 400,
      REQUEST_ALREADY_PENDING: 400,
    };

    return res.status(map[error.message] || 500).json({
      success: false,
      message: error.message.replaceAll("_", " "),
    });
  }
}

export async function getRoomDetailsController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.id;
    const { roomId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    const data = await getRoomDetailsService(roomId, userId);

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      room: data.room,
    });
  } catch (error: any) {
    const map: Record<string, number> = {
      ROOM_NOT_FOUND: 404,
      NOT_A_MEMBER: 403,
    };

    return res.status(map[error.message] || 500).json({
      success: false,
      message: error.message.replaceAll("_", " "),
    });
  }
}

import { approveJoinRequestService } from "./room.service.js";

export async function approveJoinRequestController(
  req: Request,
  res: Response,
) {
  try {
    const hostId = req.user?.id;
    const { roomId, requestUserId } = req.body;

    if (!hostId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roomId || !requestUserId) {
      return res.status(400).json({
        success: false,
        message: "roomId and requestUserId are required",
      });
    }

    const roomMember = await approveJoinRequestService(
      hostId,
      roomId,
      requestUserId,
    );

    return res.status(200).json({
      success: true,
      message: "User successfully added to the room",
      roomMember,
    });
  } catch (err: any) {
    const errorMap: Record<string, string> = {
      ROOM_NOT_FOUND: "Room not found",
      NOT_ROOM_HOST: "Only host can approve requests",
      REQUEST_NOT_FOUND: "Join request not found",
      REQUEST_NOT_PENDING: "Join request is not pending",
      ALREADY_MEMBER: "User is already a room member",
    };

    return res.status(400).json({
      success: false,
      message: errorMap[err.message] || "Failed to approve join request",
    });
  }
}

export async function rejectJoinRequestController(
  req: Request,
  res: Response,
) {
  try {
    const hostId = req.user?.id;
    const { roomId, requestUserId } = req.body;

    if (!hostId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roomId || !requestUserId) {
      return res.status(400).json({
        success: false,
        message: "roomId and requestUserId are required",
      });
    }

    await rejectJoinRequestService(hostId, roomId, requestUserId);

    return res.status(200).json({
      success: true,
      message: "Join request rejected",
    });
  } catch (err: any) {
    const errorMap: Record<string, string> = {
      ROOM_NOT_FOUND: "Room not found",
      NOT_ROOM_HOST: "Only host can reject requests",
      REQUEST_NOT_FOUND: "Join request not found",
      REQUEST_NOT_PENDING: "Join request is not pending",
    };

    return res.status(400).json({
      success: false,
      message: errorMap[err.message] || "Failed to reject join request",
    });
  }
}
