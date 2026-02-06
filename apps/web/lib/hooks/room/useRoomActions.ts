"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { leaveRoom as leaveRoomApi } from "@/lib/helpfulFunctions/roomsRelated/leaveRoom";

interface UseRoomActionsArgs {
  roomId: string;
  roomCode: string | null;
  isHost: boolean;
}

export function useRoomActions({
  roomId,
  roomCode,
  isHost,
}: UseRoomActionsArgs) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const router = useRouter();

  const leaveRoom = () => {
    if (!accessToken) return;

    leaveRoomApi({
      accessToken,
      roomId,
      isHost,
      roomCode,
    });

    router.push("/home/rooms");
  };

  const deleteRoom = () => {
    if (!accessToken) return;

    leaveRoomApi({
      accessToken,
      roomId,
      isHost,
      roomCode,
    });

    router.push("/home/rooms");
  };

  return {
    leaveRoom,
    deleteRoom,
  };
}
