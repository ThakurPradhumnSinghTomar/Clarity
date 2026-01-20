import type { Request, Response } from "express";
import { deleteOrLeaveRoomService } from "./deleteOrLeaveRoom.service.js";

export async function deleteOrLeaveRoomController(
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
        message: "roomId is required",
      });
    }

    const result = await deleteOrLeaveRoomService(userId, roomId);

    return res.status(200).json({
      success: true,
      message:
        result.action === "ROOM_DELETED"
          ? "Room deleted successfully"
          : "Left room successfully",
    });
  } catch (err: any) {
    const errorMap: Record<string, string> = {
      ROOM_NOT_FOUND: "Room not found",
      NOT_A_MEMBER: "You are not a member of this room",
    };

    return res.status(400).json({
      success: false,
      message: errorMap[err.message] || "Failed to leave/delete room",
    });
  }
}
