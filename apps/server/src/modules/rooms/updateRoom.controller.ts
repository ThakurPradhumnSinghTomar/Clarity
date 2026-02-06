import type { Request, Response } from "express";
import { updateRoomService } from "./updateRoom.service.js";

export async function updateRoomController(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user?.id;
    const { roomId, name, description, isPublic, membersToRemove } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      !roomId ||
      !name ||
      !description ||
      typeof isPublic !== "boolean" ||
      !Array.isArray(membersToRemove)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request payload",
      });
    }

    await updateRoomService({
      roomId,
      userId,
      name,
      description,
      isPublic,
      membersToRemove,
    });

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
    });
  } catch (err: any) {
    const errorMap: Record<string, string> = {
      ROOM_NOT_FOUND: "Room not found",
      NOT_ROOM_HOST: "Only host can update the room",
    };

    return res.status(400).json({
      success: false,
      message: errorMap[err.message] || "Failed to update room",
    });
  }
}
