"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { RoomChatMessage } from "@repo/ui";

// This interface models the chat message shape returned by backend APIs and socket events.
type BackendRoomChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id?: string;
    name?: string;
  };
};

// This helper provides the supported backend paths for fetching historical messages.
const getMessageListEndpoints = (roomId: string) => [
  `/api/room/${roomId}/messages`,
  `/api/room/get-room-messages/${roomId}`,
  `/api/room/messages/${roomId}`,
];

// This helper provides the supported backend paths for sending a new message.
const sendMessageEndpoints = [
  "/api/room/send-message",
  "/api/room/messages",
  "/api/room/create-message",
];

// This transformer maps backend message payloads into the reusable UI contract.
function toUiMessage(
  backendMessage: BackendRoomChatMessage,
  currentUserId?: string,
): RoomChatMessage {
  return {
    id: backendMessage.id,
    senderName: backendMessage.sender?.name || "Unknown",
    text: backendMessage.content,
    createdAt: backendMessage.createdAt,
    isCurrentUser: backendMessage.senderId === currentUserId,
  };
}

// This custom hook centralizes room-chat data loading, sending, and live updates.
export function useRoomChat(roomId: string) {
  // Session gives us auth token and current user identity for message ownership checks.
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const currentUserId = session?.user?.id;

  // Local message state is intentionally normalized to the shared UI message type.
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  // Loading state is used by the view to render skeleton/placeholder UX.
  const [isLoading, setIsLoading] = useState(true);
  // Sending state is used to prevent duplicate submits while post is in-flight.
  const [isSending, setIsSending] = useState(false);
  // Error state keeps user feedback explicit for load/send failures.
  const [error, setError] = useState<string | null>(null);

  // Backend base URL is memoized so effects only react when env/session context changes.
  const backendUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || "",
    [],
  );

  // This function attempts multiple known backend list endpoints and returns first successful payload.
  const fetchMessages = useCallback(async () => {
    if (!accessToken || !roomId || !backendUrl) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response: Response | null = null;

      for (const endpoint of getMessageListEndpoints(roomId)) {
        const attempt = await fetch(`${backendUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (attempt.ok) {
          response = attempt;
          break;
        }
      }

      if (!response) {
        throw new Error("Unable to load room chat messages.");
      }

      const payload = await response.json();
      const rawMessages: BackendRoomChatMessage[] =
        payload.messages || payload.data || payload.roomMessages || [];

      setMessages(rawMessages.map((message) => toUiMessage(message, currentUserId)));
    } catch (fetchError) {
      console.error("useRoomChat fetch error:", fetchError);
      setError("Failed to load room chat.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, backendUrl, currentUserId, roomId]);

  // This function tries known send endpoints and appends response message once accepted by backend.
  const sendMessage = useCallback(
    async (content: string) => {
      if (!accessToken || !roomId || !backendUrl) {
        return;
      }

      setIsSending(true);
      setError(null);

      try {
        let response: Response | null = null;

        for (const endpoint of sendMessageEndpoints) {
          const attempt = await fetch(`${backendUrl}${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              roomId,
              content,
            }),
          });

          if (attempt.ok) {
            response = attempt;
            break;
          }
        }

        if (!response) {
          throw new Error("Unable to send room chat message.");
        }

        const payload = await response.json();
        const createdMessage: BackendRoomChatMessage | undefined =
          payload.message || payload.data;

        if (createdMessage) {
          setMessages((previousMessages) => [
            ...previousMessages,
            toUiMessage(createdMessage, currentUserId),
          ]);
        } else {
          // If backend doesn't return created object, we fallback to refetch for consistency.
          await fetchMessages();
        }
      } catch (sendError) {
        console.error("useRoomChat send error:", sendError);
        setError("Failed to send message.");
      } finally {
        setIsSending(false);
      }
    },
    [accessToken, backendUrl, currentUserId, fetchMessages, roomId],
  );

  // This effect loads initial message history whenever room/auth context becomes ready.
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // This effect performs lightweight polling so chat stays fresh even without websocket wiring.
  useEffect(() => {
    if (!accessToken || !roomId || !backendUrl) {
      return;
    }

    const pollTimer = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => {
      // Cleanup guarantees we do not continue polling after leaving the room page.
      clearInterval(pollTimer);
    };
  }, [accessToken, backendUrl, fetchMessages, roomId]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    reloadMessages: fetchMessages,
  };
}
