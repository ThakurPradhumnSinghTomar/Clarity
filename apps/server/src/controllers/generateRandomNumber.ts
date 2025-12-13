import prisma from "../prismaClient.js";

export const generateRoomCode = async (): Promise<string> => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing: 0,O,1,I
  const length = 6;
  let roomCode: string;
  let isUnique = false;

  while (!isUnique) {
    roomCode = '';
    for (let i = 0; i < length; i++) {
      roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const existing = await prisma.room.findUnique({
      where: { roomCode: roomCode }
    });
    
    if (!existing) {
      isUnique = true;
    }
  }
  
  return roomCode!;
};