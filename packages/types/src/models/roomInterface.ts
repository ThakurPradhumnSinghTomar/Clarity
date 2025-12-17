export interface Room {
  id: string;
  name: string;
  description: string | null;
  roomCode: string;
  isPublic: boolean;
  hostId: string;
  createdAt: string;
  updatedAt: string;
  memberCount : number
}