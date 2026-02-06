"use client";

import { RoomData } from "@repo/types";

type PendingRequestsTabProps = {
  roomData: RoomData;
  reqProcessing: boolean;
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
};

export function PendingRequestsTab({
  roomData,
  reqProcessing,
  onAccept,
  onReject,
}: PendingRequestsTabProps) {
  const requests = roomData.joinRequests ?? [];

  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
      {requests.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No pending join request for this room...</p>
      ) : (
        <div className="flex-col gap-2 w-full h-[500px] overflow-y-auto scrollbar-hide">
          {requests.map((joinRequest) => (
            <div
              key={joinRequest.userId}
              className="m-4 rounded-2xl p-2 px-4 flex justify-between bg-[var(--color-surface-elevated)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 overflow-hidden rounded-full">
                  <img
                    src={joinRequest.user.image}
                    alt="user profile image"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="font-semibold text-md text-[var(--color-text)]">
                  <p>{joinRequest.user.name}</p>
                </div>
              </div>

              {joinRequest.status === "pending" ? (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => onAccept(joinRequest.userId)}
                    className="bg-[var(--color-accent-green)]/90 text-black rounded-2xl p-2 px-4"
                  >
                    {reqProcessing ? "loading.." : "Accept"}
                  </button>

                  <button
                    onClick={() => onReject(joinRequest.userId)}
                    className="bg-[var(--color-accent-red)]/90 text-black rounded-2xl p-2 px-4"
                  >
                    {reqProcessing ? "loading.." : "Reject"}
                  </button>
                </div>
              ) : (
                <div className="bg-[var(--color-accent-yellow)]/90 text-black rounded-2xl p-2 px-4">
                  {joinRequest.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
