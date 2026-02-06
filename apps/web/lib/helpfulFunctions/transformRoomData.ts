import { Room } from "@repo/types";
import { getRandomColor } from "./roomsRelated/getRandomColour";

export const transformRoomData = (room: Room) => ({
    id: room.id,
    name: room.name,
    memberCount: room.memberCount, 
    focusingCount: room.focusingCount, // Will need to add this from your API
    lastActive: new Date(room.updatedAt).toLocaleDateString(),
    color: getRandomColor()
  });
