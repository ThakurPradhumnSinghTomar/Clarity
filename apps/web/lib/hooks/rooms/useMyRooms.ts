"use client";

import { useEffect, useState, useCallback } from "react";
import { Room } from "@repo/types";
import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";
import { useSession } from "next-auth/react";

export function useMyRooms() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(() => {
    if (!accessToken) return;

    fetchMyRooms({
      setIsLoadingRooms: setIsLoading,
      setError,
      accessToken,
      setMyRooms: setRooms,
    });
  }, [accessToken]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return {
    rooms,
    isLoading,
    error,
    refetch: loadRooms,
  };
}
