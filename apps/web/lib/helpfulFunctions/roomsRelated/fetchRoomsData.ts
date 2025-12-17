import { Room } from "@repo/types";
import React from "react";
import { toast } from "react-toastify";



type fetchMyRoomsParams = {
    setIsLoadingRooms : React.Dispatch<React.SetStateAction<boolean>>
    setError : React.Dispatch<React.SetStateAction<string|null>> 
    accessToken : string
    setMyRooms : React.Dispatch<React.SetStateAction<Room[]>>



}





export const fetchMyRooms = async ({
    setIsLoadingRooms,
    setError,
    accessToken,
    setMyRooms  
} : fetchMyRoomsParams) => {
    setIsLoadingRooms(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/get-my-rooms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch rooms');
      }

      setMyRooms(data.rooms || []);
      console.log('Fetched rooms:', data.rooms);

    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      setError(error.message);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoadingRooms(false);
    }
  };
