import { Room } from "@repo/types";
import { fetchMyRooms } from "./fetchRoomsData";
import { toast } from "react-toastify";

 export const handleCreateRoom = async (roomName: string, isPrivate: boolean, roomDiscription: string, setIsCreatingRoom : React.Dispatch<React.SetStateAction<boolean>>, setIsLoadingRooms : React.Dispatch<React.SetStateAction<boolean>>, setError : React.Dispatch<React.SetStateAction<string|null>>, accessToken : string, setMyRooms : React.Dispatch<React.SetStateAction<Room[]>> ) => {
    setIsCreatingRoom(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: roomName,
          description: roomDiscription,
          isPublic: !isPrivate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room');
      }

      console.log('Room created successfully:', data.room);
      toast.success(`Room created! Code: ${data.room.roomCode}`);
      
      // Refresh the rooms list
      await fetchMyRooms({setIsLoadingRooms, setError, accessToken, setMyRooms });

    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.error(error.message || 'Failed to create room');
    } finally {
      setIsCreatingRoom(false);
    }
  };
