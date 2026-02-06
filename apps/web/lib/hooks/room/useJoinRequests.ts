"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface UseJoinRequestsArgs {
  roomId: string;
  roomCode: string | null;
}

export function useJoinRequests({ roomId, roomCode }: UseJoinRequestsArgs) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [isProcessing, setIsProcessing] = useState(false);

  const acceptRequest = async (userId: string) => {
    if (!accessToken || !roomCode) return;

    try {
      setIsProcessing(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/approve-joinroom-req`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            roomId,
            roomCode,
            RequserId: userId,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to accept join request");
      }
    } catch (err) {
      console.error("acceptRequest error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectRequest = async (userId: string) => {
    if (!accessToken || !roomCode) return;

    try {
      setIsProcessing(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/reject-joinroom-req`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            roomId,
            roomCode,
            RequserId: userId,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to reject join request");
      }
    } catch (err) {
      console.error("rejectRequest error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    acceptRequest,
    rejectRequest,
  };
}
