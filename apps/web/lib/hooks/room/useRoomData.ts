"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { RoomData, RoomMember } from "@repo/types";


export function useRoomData(roomId: string) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoom = useCallback(async () => {
    if (!accessToken || !roomId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/get-room/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to load room data");
      }

      const data = await res.json();

      setRoomData(data.room);
      setMembers(data.room.members ?? []);
    } catch (err) {
      console.error("useRoomData error:", err);
      setError("Unable to load room data");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  return {
    roomData,
    members,
    isLoading,
    error,
    reloadRoom: loadRoom,
    setRoomData,
    setMembers
  };
}

