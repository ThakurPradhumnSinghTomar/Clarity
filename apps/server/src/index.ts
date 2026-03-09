// ================================
// IMPORTS
// ================================

// Express framework for REST APIs
import express from "express";

// CORS middleware to allow frontend requests
import cors from "cors";

// Node HTTP module → REQUIRED for Socket.IO
import http from "http";

// Socket.IO server class
import { Server } from "socket.io";
import prisma from "./prismaClient.js";

// ================================
// ROUTE IMPORTS (Your existing)
// ================================

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import roomRouter from "./routes/room.js";
import { getFirebaseMessaging } from "./firebaseAdmin.js";

// Shared payload shape for WebRTC signaling relays over Socket.IO.
// Server intentionally does not inspect SDP/candidate deeply; it forwards to target peer.
// Shared payload shape for WebRTC signaling relays over Socket.IO.
// Server intentionally does not inspect SDP/candidate deeply; it forwards to target peer.
type SignalPayload = {
  roomId: string;
  targetSocketId: string;
  offer?: Record<string, unknown>;
  answer?: Record<string, unknown>;
  candidate?: Record<string, unknown>;
};

const getCameraRoomId = (roomId: string) => `camera:${roomId}`;


// ================================
// CREATE EXPRESS APP
// ================================

const app = express();

// ================================
// CORS CONFIGURATION
// ================================

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://rebuild-with-pradhumn.vercel.app",
];

// Apply CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // (Postman, curl, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },

    // Allow cookies / auth headers
    credentials: true,
  }),
);

// ================================
// BODY PARSER
// ================================

// Allows JSON in request body
app.use(express.json());

// ================================
// BASIC TEST ROUTE
// ================================

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ================================
// API ROUTES
// ================================

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);

// ================================
// CREATE HTTP SERVER
// ================================

// IMPORTANT:
// We DO NOT use app.listen anymore.
// We create raw HTTP server instead
// so Socket.IO can attach to it.

const server = http.createServer(app);

// ================================
// ATTACH SOCKET.IO SERVER
// ================================

const io = new Server(server, {
  // Socket CORS config
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Function to send push notifications to all members of a room
// except the person who triggered the action (actorId)
async function sendPushToRoomMembers({
  roomId,
  actorId,
  title,
  body,
}: {
  roomId: string;
  actorId: string;
  title: string;
  body: string;
}) {

  // Get Firebase Cloud Messaging instance
  // This was created in the helper file you wrote earlier
  const messaging = getFirebaseMessaging();

  // If Firebase is not configured correctly, stop execution
  if (!messaging) return;


  // Fetch the room information from the database using Prisma
  const room = await prisma.room.findUnique({
    where: { id: roomId },

    // Only select the fields we actually need
    // This improves performance and avoids unnecessary data transfer
    select: {
      name: true,

      // Fetch the host of the room
      host: {
        select: { id: true, fcmTokens: true },
      },

      // Fetch all room members
      members: {
        select: {
          user: {
            select: { id: true, fcmTokens: true },
          },
        },
      },
    },
  });

  // If the room doesn't exist, exit the function
  if (!room) return;


  // Create a Set to store unique FCM tokens
  // Using Set ensures we don't accidentally send
  // multiple notifications to the same device
  const tokens = new Set<string>();


  // If the actor is NOT the host
  // then send the notification to the host as well
  if (room.host.id !== actorId) {

    // Add all host device tokens to the set
    room.host.fcmTokens.forEach((token) => tokens.add(token));
  }


  // Loop through all room members
  for (const member of room.members) {

    // Skip the actor (the user who triggered the action)
    // because they shouldn't receive their own notification
    if (member.user.id === actorId) continue;

    // Add each member's device tokens to the set
    member.user.fcmTokens.forEach((token) => tokens.add(token));
  }


  // If there are no tokens, there is no device to notify
  // so we stop execution
  if (!tokens.size) return;


  // Send the push notification to all collected device tokens
  const response = await messaging.sendEachForMulticast({

    // Convert the Set of tokens into an array
    tokens: Array.from(tokens),

    // Notification payload
    // This is the message that appears in the user's notification tray
    notification: {
      title,
      body,
    },

    // Additional custom data payload
    // This can be used by the app to perform actions
    // when the notification is clicked
    data: {
      roomId,
      roomName: room.name,
    },
  });


  // If any notifications failed to send
  // log the number of failures
  if (response.failureCount > 0) {
    console.warn(`Push notification failures: ${response.failureCount}`);
  }
}



// Function to notify all rooms when a user starts a focus session
async function sendFocusStartedPushToUserRooms(userId: string, userName?: string) {

  // Find all rooms where the user participates
  const rooms = await prisma.room.findMany({

    where: {

      // User could either be:
      // 1) the host of the room
      // 2) a member of the room
      OR: [{ hostId: userId }, { members: { some: { userId } } }],
    },

    // We only need the room id
    select: { id: true },
  });


  // Loop through all rooms the user belongs to
  for (const room of rooms) {

    // Send a notification to all other members of the room
    await sendPushToRoomMembers({

      // Room where the event occurred
      roomId: room.id,

      // The user who triggered the event
      actorId: userId,

      // Notification title
      title: "Focus session started",

      // Notification message body
      // If username exists use it, otherwise fallback text
      body: `${userName || "A member"} just started focusing`,
    });
  }
}



async function emitFocusChangeToUserRooms(userId: string, isFocusing: boolean) {
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
    select: {
      id: true,
    },
  });

  for (const room of rooms) {
    io.to(room.id).emit("user_focusing_changed", { userId, isFocusing });
  }
}

// ================================
// SOCKET CONNECTION LOGIC
// ================================

// Fires whenever a client connects
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", ({ roomId }) => {
    // Join socket.io room
    socket.join(roomId);

    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("register_user", ({ userId }) => {
    socket.join(userId);

    // store mapping
    socket.data.userId = userId;

    console.log("Individual user joined:", userId);
  });

   socket.on("started_focussing", async ({ userId, userName }) => {
    // Ensure we can resolve this user on disconnect even if register_user
    // was never emitted from the client.
    socket.data.userId = userId;
    console.log("user started focussing and its state is updated");
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focusing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isFocusing: true,
        userId,
      }),
    });
    await sendFocusStartedPushToUserRooms(userId, userName);
    await emitFocusChangeToUserRooms(userId, true);
  });

  socket.on("stopped_focussing", async ({ userId }) => {
    // Keep the user mapping fresh for disconnect cleanup logic.
    socket.data.userId = userId;

    console.log("user is stopping focussing and its state is updated");
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focusing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isFocusing: false,
        userId,
      }),
    });
    await emitFocusChangeToUserRooms(userId, false);
  });

  // --------------------------------
  // SEND MESSAGE EVENT
  // --------------------------------
  // Client sends message to server
  // Server broadcasts to room
  // --------------------------------

  socket.on("send_message", async (data) => {
    const { roomId, message, senderId, senderName } = data;

    if (!roomId || !message || !senderId) {
      return;
    }

    try {
      const savedMessage = await prisma.message.create({
        data: {
          roomId,
          senderId,
          content: message,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      io.to(roomId).emit("receive_message", {
        id: savedMessage.id,
        roomId,
        message: savedMessage.content,
        senderId: savedMessage.senderId,
        senderName: savedMessage.sender.name || senderName || "Unknown",
        socketId: socket.id,
        time: savedMessage.createdAt,
      });
      await sendPushToRoomMembers({
        roomId,
        actorId: senderId,
        title: `New message in room`,
        body: `${savedMessage.sender.name || senderName || "Someone"}: ${savedMessage.content.slice(0, 80)}`,
      });
    } catch (error) {
      console.error("Failed to persist socket message:", error);
    }
  });

  // --------------------------------
  // DISCONNECT EVENT
  // --------------------------------

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    const userId = socket.data.userId;

    if (!userId) return;

    console.log("user disconnected so changing its focussing state to false");

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focusing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFocusing: false,
          userId,
        }),
      });

      await emitFocusChangeToUserRooms(userId, false);

      console.log(`Focus stopped for user ${userId}`);
    } catch (err) {
      console.error("Failed to stop focusing on disconnect:", err);
    }
  });

  // Camera-specific room join: returns current camera peers and notifies existing sharers.
  socket.on("camera:join-room", ({ roomId }) => {
    const cameraRoomId = getCameraRoomId(roomId);
    socket.join(cameraRoomId);

    const roomSockets = Array.from(
      io.sockets.adapter.rooms.get(cameraRoomId) ?? [],
    );
    const peers = roomSockets.filter((id) => id !== socket.id);

    socket.emit("camera:peer-list", { peers });
    socket.to(cameraRoomId).emit("camera:peer-joined", { socketId: socket.id });
  });

  // Camera-specific leave event so peers can remove stale video tiles quickly.
  socket.on("camera:leave-room", ({ roomId }) => {
    const cameraRoomId = getCameraRoomId(roomId);
    socket.leave(cameraRoomId);
    socket.to(cameraRoomId).emit("camera:peer-left", { socketId: socket.id });
  });

  // Relay SDP offer from caller -> target peer.
  socket.on(
    "webrtc:offer",
    ({ roomId, targetSocketId, offer }: SignalPayload) => {
      io.to(targetSocketId).emit("webrtc:offer", {
        roomId,
        fromSocketId: socket.id,
        offer,
      });
    },
  );

  // Relay SDP answer from callee -> original caller.
  socket.on(
    "webrtc:answer",
    ({ roomId, targetSocketId, answer }: SignalPayload) => {
      io.to(targetSocketId).emit("webrtc:answer", {
        roomId,
        fromSocketId: socket.id,
        answer,
      });
    },
  );

  // Relay trickled ICE candidates bidirectionally between peers.
  socket.on(
    "webrtc:ice-candidate",
    ({ roomId, targetSocketId, candidate }: SignalPayload) => {
      io.to(targetSocketId).emit("webrtc:ice-candidate", {
        roomId,
        fromSocketId: socket.id,
        candidate,
      });
    },
  );

  // During disconnecting, socket.rooms still contains joined rooms; use this moment
  // to broadcast peer-left so clients can clean up stale RTC connections promptly.
  // During disconnecting, socket.rooms still contains joined rooms; use this moment
  // to broadcast peer-left so clients can clean up stale RTC connections promptly.
  socket.on("disconnecting", () => {
    for (const joinedRoomId of socket.rooms) {
      if (joinedRoomId !== socket.id && joinedRoomId.startsWith("camera:")) {
        socket
          .to(joinedRoomId)
          .emit("camera:peer-left", { socketId: socket.id });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

});

// ================================
// START SERVER
// ================================

server.listen(4000, () => {
  console.log("Server + Socket running on http://localhost:4000");
});
