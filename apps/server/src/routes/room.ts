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

export default roomRouter;
