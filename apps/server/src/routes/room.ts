import express from "express";
import prisma from "../prismaClient.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { generateRoomCode } from "../controllers/generateRandomNumber.js";

const roomRouter = express.Router();

roomRouter.get("/",(req,res)=>{
    return res.status(201).json({"success":"true","message":"room router is running..."});
});




roomRouter.post("/create-room", authMiddleware, async(req, res) => {
   try {
     const userId = req.user?.id;
     
     if(!userId) {
        return res.status(401).json({
          "success": false,
          "message": "Unauthorized - please login"
        });
     }

     const { name, description, isPublic } = req.body; // No roomCode needed!

     // Proper validation
     if(!name || isPublic === undefined) {
        return res.status(400).json({
          "success": false,
          "message": "Please provide all required fields (name, isPublic)"
        });
     }

     // Generate unique room code
     const roomCode = await generateRoomCode();

     const room = await prisma.room.create({
        data: {
            name: name,
            description: description || null,
            roomCode: roomCode, // Auto-generated code
            isPublic: isPublic,
            hostId: userId
        },
     });

     return res.status(201).json({
       "success": true,
       "message": "Successfully created room",
       room
     });

   } catch(error:any) {
     console.error("Error creating room:", error);
     res.status(500).json({
       "success": false,
       "message": "Error occurred while creating room",
       error: error.message
     });
   }
});

roomRouter.get("/get-my-rooms", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        "success": false,
        "message": "Unauthorized - please login"
      });
    }

    // Get rooms where user is host OR a participant
    const myRooms = await prisma.room.findMany({
      where: {
        OR: [
          { hostId: userId }, // Rooms I created
          { 
            members: { // Rooms I joined (if you have this relation)
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        // Include participant count if needed
        _count: {
          select: {
            members : true
          }
        }
      }
    });

    return res.status(200).json({
      "success": true,
      "message": "Successfully fetched your rooms",
      "rooms": myRooms,
      "count": myRooms.length
    });

  } catch (error : any) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      "success": false,
      "message": "Error occurred while fetching rooms",
      "error": error.message
    });
  }
});


export default roomRouter;

