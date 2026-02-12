import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  approveJoinRequestController,
  createRoomController,
  getMyRoomsController,
  getRoomDetailsController,
  joinRoomController,
  rejectJoinRequestController,
} from "../modules/rooms/room.controller.js";
import { deleteOrLeaveRoomController } from "../modules/rooms/deleteOrLeaveRoom.controller.js";
import { updateRoomController } from "../modules/rooms/updateRoom.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createRoomSchema,
  joinRoomSchema,
  approveJoinRequestSchema,
  rejectJoinRequestSchema,
  leaveOrDeleteRoomSchema,
  updateRoomSchema,
  getRoomDetailsSchema,
} from "../modules/rooms/room.schema.js";
import prisma from "../prismaClient.js";

const roomRouter = express.Router();

roomRouter.get("/", (req, res) => {
  return res
    .status(201)
    .json({ success: "true", message: "room router is running..." });
});

roomRouter.post(
  "/create-room",
  authMiddleware,
  validateRequest(createRoomSchema),
  createRoomController,
);

roomRouter.patch(
  "/join-room",
  authMiddleware,
  validateRequest(joinRoomSchema),
  joinRoomController,
);

roomRouter.post(
  "/approve-joinroom-req",
  authMiddleware,
  validateRequest(approveJoinRequestSchema),
  approveJoinRequestController,
);

roomRouter.post(
  "/reject-joinroom-req",
  authMiddleware,
  validateRequest(rejectJoinRequestSchema),
  rejectJoinRequestController,
);

roomRouter.delete(
  "/leave-room/:roomId",
  authMiddleware,
  validateRequest(leaveOrDeleteRoomSchema),
  deleteOrLeaveRoomController,
);

roomRouter.patch(
  "/update-room",
  authMiddleware,
  validateRequest(updateRoomSchema),
  updateRoomController,
);

roomRouter.get(
  "/get-room/:roomId",
  authMiddleware,
  validateRequest(getRoomDetailsSchema),
  getRoomDetailsController,
);

roomRouter.get(
  "/get-my-rooms",
  authMiddleware,
  getMyRoomsController
)



roomRouter.get("/:roomId/messages", authMiddleware, async (req, res) => {

  try {

    // ----------------------------------------
    // 1️⃣ Extract roomId from URL params
    // Example: /api/room/abc123/messages
    // ----------------------------------------

    const { roomId } = req.params;
    if(!roomId){
      return res.status(201).json({"success":"false","message":"please send room Id "})
    }


    // ----------------------------------------
    // 2️⃣ Fetch messages from database
    // ----------------------------------------

    const messages = await prisma.message.findMany({

      // Filter → only this room’s messages
      where: {
        roomId: roomId
      },

      // Include sender details
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },

      // Sort messages oldest → newest
      orderBy: {
        createdAt: "asc"
      }
    });


    // ----------------------------------------
    // 3️⃣ Send response
    // ----------------------------------------

    const normalizedMessages = messages.map((item) => ({
      id: item.id,
      roomId: item.roomId,
      senderId: item.senderId,
      senderName: item.sender?.name || "Unknown",
      message: item.content,
      time: item.createdAt,
    }));

    res.status(200).json({
      success: true,
      messages: normalizedMessages
    });

  } catch (error) {

    console.error(
      "Error fetching messages:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to load messages"
    });
  }
});

export default roomRouter;
