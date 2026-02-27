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



// Shared payload shape for WebRTC signaling relays over Socket.IO.
// Server intentionally does not inspect SDP/candidate deeply; it forwards to target peer.
type SignalPayload = {
  roomId: string;
  targetSocketId: string;
  offer?: Record<string, unknown>;
  answer?: Record<string, unknown>;
  candidate?: Record<string, unknown>;
};



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

  socket.on("started_focussing", async ({ userId }) => {
    console.log("user started focussing and its state is updated");
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focusing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isFocusing: true,
        userId,
      }),
    });
    await emitFocusChangeToUserRooms(userId, true);
  });

  socket.on("stopped_focussing", async ({ userId }) => {
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
    socket.join(roomId);

    const roomSockets = Array.from(io.sockets.adapter.rooms.get(roomId) ?? []);
    const peers = roomSockets.filter((id) => id !== socket.id);

    socket.emit("camera:peer-list", { peers });
    socket.to(roomId).emit("camera:peer-joined", { socketId: socket.id });
  });

  // Camera-specific leave event so peers can remove stale video tiles quickly.
  socket.on("camera:leave-room", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("camera:peer-left", { socketId: socket.id });
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
  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("camera:peer-left", { socketId: socket.id });
      }
    }
  });

  
});




// ================================
// START SERVER
// ================================

server.listen(4000, () => {
  console.log("Server + Socket running on http://localhost:4000");
});
