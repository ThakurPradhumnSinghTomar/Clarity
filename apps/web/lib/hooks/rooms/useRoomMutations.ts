"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

export function useRoomMutations(onSuccess?: () => void) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [isCreating, setIsCreating] = useState(false);

  const createRoom = async (
    name: string,
    isPrivate: boolean,
    description: string
  ) => {
    setIsCreating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name,
            description,
            isPublic: !isPrivate,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(`Room created · Code: ${data.room.roomCode}`);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async (inviteCode: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/join-room`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ roomCode: inviteCode }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      data.joinRequest
        ? toast.info(data.message)
        : toast.success(`Joined ${data.room.name}`);

      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to join room");
    }
  };

  return {
    createRoom,
    joinRoom,
    isCreating,
  };
}
