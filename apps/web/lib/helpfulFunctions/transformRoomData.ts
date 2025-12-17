import { Room } from "@repo/types";
import { getRandomColor } from "./roomsRelated/getRandomColour";

export const transformRoomData = (room: Room) => ({
    id: room.id,
    name: room.name,
    memberCount: room.memberCount|| 0,
    totalStudyTime: 0, // Will need to add this from your API
    rank: 0, // Will need to calculate this
    lastActive: new Date(room.updatedAt).toLocaleDateString(),
    color: getRandomColor()
  });
