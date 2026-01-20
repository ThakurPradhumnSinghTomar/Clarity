import express from "express";
import prisma from "../prismaClient.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { generateRoomCode } from "../controllers/generateRandomNumber.js";
import { error } from "node:console";
import { approveJoinRequestController, createRoomController, getMyRoomsController, getRoomDetailsController, joinRoomController, rejectJoinRequestController } from "../modules/rooms/room.controller.js";
import { deleteOrLeaveRoomController } from "../modules/rooms/deleteOrLeaveRoom.controller.js";
import { updateRoomController } from "../modules/rooms/updateRoom.controller.js";

const roomRouter = express.Router();



roomRouter.get("/", (req, res) => {
  return res
    .status(201)
    .json({ success: "true", message: "room router is running..." });
});

roomRouter.post(
  "/create-room",
  authMiddleware,
  createRoomController,
);


roomRouter.get(
  "/get-my-rooms",
  authMiddleware,
  getMyRoomsController,
);

roomRouter.post(
  "/approve-joinroom-req",
  authMiddleware,
  approveJoinRequestController,
);

roomRouter.post(
  "/reject-joinroom-req",
  authMiddleware,
  rejectJoinRequestController,
);

roomRouter.patch(
  "/join-room",
  authMiddleware,
  joinRoomController,
);

roomRouter.get(
  "/get-room/:roomId",
  authMiddleware,
  getRoomDetailsController,
);

roomRouter.delete(
  "/leave-room/:roomId",
  authMiddleware,
  deleteOrLeaveRoomController,
);

roomRouter.patch(
  "/update-room",
  authMiddleware,
  updateRoomController,
);

export default roomRouter;
