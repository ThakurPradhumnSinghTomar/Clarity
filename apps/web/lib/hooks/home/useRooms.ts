"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Room } from "@repo/types";

import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";

export function useRooms() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    fetchMyRooms({
      accessToken,
      setMyRooms: setRooms,
      setIsLoadingRooms: setIsLoading,
      setError: () => {},
    });
  }, [accessToken]);

  return {
    isLoading,
    rooms,
  };
}
