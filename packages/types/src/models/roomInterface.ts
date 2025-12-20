export interface Room {
  id: string;
  name: string;
  description: string | null;
  roomCode: string;
  isPublic: boolean;
  hostId: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
}

export type RoomMember = {
  id: string;
  userId : string;
  name: string;
  email: string;
  avatar: string;
  isFocusing: boolean;
  studyTime: number;
  rank: number;
};

type joinRequest = {
  id: string;
  userId: string;
  roomId: string;
  status: string;
  createdAt: string;
  room: { roomCode: string };
  user: { name: string; image: string };
};

export type RoomData = {
  id: string;
  name: string;
  description: string;
  roomCode: string;
  isPublic: boolean;
  isHost: boolean;
  hostId : string;
  memberCount: number;
  totalStudyTime: number;
  members: RoomMember[];
  joinRequests: joinRequest[];
};
