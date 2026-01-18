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
    <div className="bg-white dark:bg-[#18181B] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      {requests.length === 0 ? (
        <p>No pending join request for this room...</p>
      ) : (
        <div className="flex-col gap-2 w-full h-[500px] overflow-y-auto scrollbar-hide">
          {requests.map((joinRequest) => (
            <div
              key={joinRequest.userId}
              className="m-4 rounded-2xl p-2 px-4 flex justify-between bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 overflow-hidden rounded-full">
                  <img
                    src={joinRequest.user.image}
                    alt="user profile image"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="font-semibold text-md text-black dark:text-white">
                  <p>{joinRequest.user.name}</p>
                </div>
              </div>

              {joinRequest.status === "pending" ? (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => onAccept(joinRequest.userId)}
                    className="bg-green-400 rounded-2xl p-2 px-4"
                  >
                    {reqProcessing ? "loading.." : "Accept"}
                  </button>

                  <button
                    onClick={() => onReject(joinRequest.userId)}
                    className="bg-red-400 rounded-2xl p-2 px-4"
                  >
                    {reqProcessing ? "loading.." : "Reject"}
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-400 rounded-2xl p-2 px-4">
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
