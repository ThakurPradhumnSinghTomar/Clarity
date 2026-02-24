"use client";

import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { RoomChatMessage } from "@repo/ui";

type UseRoomMessagesProps = {
  roomId: string;
  currentUserId?: string;
};

export function useRoomMessages({ roomId, currentUserId }: UseRoomMessagesProps) {
  // -----------------------------------------
  // STATE
  // -----------------------------------------
  // Array because room has MANY messages
  // -----------------------------------------
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);

  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  // -----------------------------------------
  // FETCH OLD MESSAGES
  // -----------------------------------------
  useEffect(() => {
    if (!accessToken || !roomId) return;

    const fetchMessages = async () => {
      try {


        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/${roomId}/messages`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to fetch messages of this room",
          );
        }

        const normalizedMessages = (data.messages || []).map((message: RoomChatMessage) => ({
          ...message,
          isCurrentUser: currentUserId ? message.senderId === currentUserId : false,
        }));

        setMessages(normalizedMessages);
      } catch (e) {
        console.error("Error fetching room messages:", e);
      }
    };

    fetchMessages();
  }, [accessToken, roomId, currentUserId]);

  // -----------------------------------------
  // SOCKET LISTENER → REALTIME MESSAGES
  // -----------------------------------------
  useEffect(() => {
    if (!roomId) return;

    const handleReceiveMessage = (data: RoomChatMessage) => {
      const incoming = {
        ...data,
        isCurrentUser: currentUserId ? data.senderId === currentUserId : false,
      };

      setMessages((prev) => [...prev, incoming]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [roomId, currentUserId]);

  // -----------------------------------------
  // RETURN
  // -----------------------------------------
  return {
    messages,
    setMessages, // useful if you want optimistic UI
  };
}

export function useJoinRoomChat(roomId: string) {
  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", { roomId });

    console.log("Joined socket room:", roomId);

    return () => {
      socket.emit("leave_room", { roomId });
    };
  }, [roomId]);
}

export function useRegisterUser(userId : string){
  useEffect(()=>{
    if(!userId){
      return
    }

    if (socket.connected) return ;
    if (!socket.connected) socket.connect();

    socket.emit("register_user",{userId})
    console.log("register a new user to socket:", userId);

    //return runs when dependencies changes and it rerenders 
    return ()=>{
      socket.emit("unregister_user",{userId})
    }

  },[userId])
}
