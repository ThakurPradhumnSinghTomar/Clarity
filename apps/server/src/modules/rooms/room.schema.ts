import { z } from "zod";

/* ===================== Common ===================== */

export const roomIdParam = z.object({
  params: z.object({
    roomId: z.string().min(1),
  }),
});

/* ===================== Create Room ===================== */

export const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    isPublic: z.boolean(),
  }),
});

/* ===================== Join Room ===================== */

export const joinRoomSchema = z.object({
  body: z.object({
    roomCode: z.string().min(4),
  }),
});

/* ===================== Approve Join Request ===================== */

export const approveJoinRequestSchema = z.object({
  body: z.object({
    roomId: z.string().min(1),
    roomCode: z.string().min(4),
    RequserId: z.string().min(1),
  }),
});

/* ===================== Reject Join Request ===================== */

export const rejectJoinRequestSchema = z.object({
  body: z.object({
    roomId: z.string().min(1),
    roomCode: z.string().min(4),
    RequserId: z.string().min(1),
  }),
});

/* ===================== Get My Rooms ===================== */
/* No body / params needed */
export const getMyRoomsSchema = z.object({});

/* ===================== Get Room Details ===================== */

export const getRoomDetailsSchema = roomIdParam;

/* ===================== Leave / Delete Room ===================== */

export const leaveOrDeleteRoomSchema = z.object({
  params: z.object({
    roomId: z.string().min(1),
  }),
  body: z.object({
    isHost: z.boolean(),
    roomCode: z.string().min(4).optional(),
  }),
});

/* ===================== Update Room ===================== */

export const updateRoomSchema = z.object({
  body: z.object({
    roomId: z.string().min(1),
    name: z.string().min(3),
    description: z.string().min(1),
    isPublic: z.boolean(),
    membersToRemove: z.array(z.string()).default([]),
  }),
});
