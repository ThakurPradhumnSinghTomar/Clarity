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

 export type RoomMember = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isFocusing: boolean;
  studyTime: number;
  rank: number;
};

export  type RoomData = {
  id: string;
  name: string;
  description: string;
  roomCode: string;
  isPublic: boolean;
  isHost: boolean;
  memberCount: number;
  totalStudyTime: number;
  members: RoomMember[];
};