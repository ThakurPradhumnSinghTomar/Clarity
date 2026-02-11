"use client";

import { useMemo, useState, type FormEvent } from "react";

// This interface describes one chat message item that will be rendered in the chat timeline.
export type RoomChatMessage = {
  // A stable identifier is used as React's `key` when mapping messages.
  id: string;

  socketId: string
  // The display name shown next to each message bubble.
  senderName: string;
  // The plain-text body of the chat message.
  message: string;
  // The message timestamp, provided as a Date object or parsable string.
  time: Date | string;
  // This flag helps the component align and style the current user's messages differently.
  isCurrentUser: boolean;
};

// These props keep the chat component reusable and presentation-focused.
export type RoomChatProps = {
  // The full list of messages to render.
  messages: RoomChatMessage[];
  // Callback invoked when the user submits a new message.
  onSendMessage: (message: string) => void;
  // Optional loading state for disabling interactions during async sends.
  isSending?: boolean;
  // Optional placeholder text for the composer input.
  placeholder?: string;
};

export function RoomChat({
  messages,
  onSendMessage,
  isSending = false,
  placeholder = "Write a message to your room...",
}: RoomChatProps) {
  // Local state is scoped to the input so this component remains controlled for message history.
  const [draftMessage, setDraftMessage] = useState("");

  // We normalize timestamps once per render cycle so each message row can stay simple.
  console.log("messages:", messages);
  console.log("isArray:", Array.isArray(messages));
  console.log(messages.map(m => m.time));

  const normalizedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        createdAtLabel: new Date(message.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    [messages],
  );

  // This handler prevents empty submissions and delegates send behavior to the parent abstraction.
  const handleSubmitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    onSendMessage(trimmedMessage);
    setDraftMessage("");
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] shadow-sm">
      {/* Chat feed container with a fixed height for predictable scrolling. */}
      <div className="h-[360px] overflow-y-auto p-4 space-y-4">
        {normalizedMessages.length > 0 ? (
          normalizedMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.isCurrentUser
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {/* Sender + time metadata gives context for each message bubble. */}
                <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                  <span className="font-semibold">{message.senderName}</span>
                  <span>{message.createdAtLabel}</span>
                </div>
                <p className="text-sm leading-relaxed break-words">
                  {message.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          // Empty state keeps the tab useful before the first message is sent.
          <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation.
          </div>
        )}
      </div>

      {/* Composer form allows keyboard-enter submission and button-click submission. */}
      <form
        onSubmit={handleSubmitMessage}
        className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2"
      >
        <input
          value={draftMessage}
          onChange={(event) => setDraftMessage(event.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isSending}
          aria-label="Room chat message"
        />
        <button
          type="submit"
          disabled={isSending || draftMessage.trim().length === 0}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
