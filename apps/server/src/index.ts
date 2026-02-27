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
});

// ================================
// START SERVER
// ================================

server.listen(4000, () => {
  console.log("Server + Socket running on http://localhost:4000");
});
