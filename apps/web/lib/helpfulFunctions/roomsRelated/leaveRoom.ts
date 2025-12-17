export async function leaveRoom({ accessToken, roomId, isHost,roomCode }: { accessToken: string; roomId: string; isHost:boolean; roomCode : string|null}) {
  try {

    if(!roomCode){throw Error("no room code in the room Data")}
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/leave-room/${roomId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isHost,roomCode }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to leave room");
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong while leaving room");
  }
}
