import { toast } from "react-toastify";
import { fetchMyRooms } from "./fetchRoomsData";
import { Room } from "@repo/types";

  export const handleJoinRoom = async (inviteCode: string, setIsLoadingRooms : React.Dispatch<React.SetStateAction<boolean>>, setError : React.Dispatch<React.SetStateAction<string|null>>, accessToken : string, setMyRooms : React.Dispatch<React.SetStateAction<Room[]>>) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/join-room`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        roomCode: inviteCode
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to join room');
    }

    // Check if it's a join request or direct join
    if (data.joinRequest) {
      toast.info(data.message); // "Join request sent..."
    } else {
      toast.success(`Joined ${data.room.name}!`);
      // Optionally navigate to the room
      // router.push(`/rooms/${data.room.id}`);
    }

    await fetchMyRooms({setIsLoadingRooms, setError, accessToken, setMyRooms }); // Refresh room list

  } catch (error: any) {
    console.error('Error joining room:', error);
    toast.error(error.message || 'Failed to join room');
  }
};
