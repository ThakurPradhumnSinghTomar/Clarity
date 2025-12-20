"use client";
import { RoomData, RoomMember } from "@repo/types";
import React, { useState } from "react";
import {
  X,
  Lock,
  Globe,
  Key,
  Loader2,
  Crown,
  Medal,
  Clock,
  UserPlus,
} from "lucide-react";
import { useSession } from "next-auth/react";

type EditRoomModelProps = {
  roomData: RoomData;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditRoomModel = ({
  roomData,
  isOpen,
  setIsOpen,
}: EditRoomModelProps) => {
  const [roomName, setRoomName] = useState(roomData.name);
  const [roomDes, setRoomDes] = useState(roomData.description);
  const [isPrivate, setIsPrivate] = useState(!roomData.isPublic);
  const [memToRemove, setMemToRemove] = useState<RoomMember[]>([]);
  const [isUpdating,setIsUpdating] = useState(false);
  const { data: session } = useSession()

async function updateRoom() {
  setIsUpdating(true);
  try {
    console.log("membersToDelete Are : ",memToRemove)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/update-room`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          name: roomName,
          description: roomDes,
          isPublic: !isPrivate,
          roomId :roomData.id,
          membersToRemove: memToRemove.map(m => m.userId),
        }),
      }
    );

    if (!res.ok) {
      setIsUpdating(false);
      const err = await res.json();
      throw new Error(err.message || "Room update failed");
    }

    const data = await res.json();
    console.log("Room updated:", data);
    setIsUpdating(false);

  } catch (error) {
    setIsUpdating(false);
    console.error("Update room error:", error);
  }
}


  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    return null;
  };

  
 const handelRemoveMemberClick = (member: RoomMember) => {
  setMemToRemove(prev => {
    const exists = prev.some(m => m.id === member.id);

    if (exists) {
      return prev.filter(m => m.id !== member.id);
    }

    return [...prev, member];
  });
};



  if (!isOpen) return null;

  return (
    // 🔹 Overlay (scroll lives here)
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto scrollbar-hide">
      {/* 🔹 Centering wrapper */}
      <div className="min-h-screen flex justify-center p-4">
        {/* 🔹 Modal */}
        <div className="bg-white dark:bg-gray-800 w-[400px] rounded-lg flex flex-col my-10">
          {/* Header */}
          <div className="flex justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Update Your Room
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 dark:text-gray-300 hover:text-red-500"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            {/* Room Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Description
              </label>
              <input
                type="text"
                value={roomDes}
                onChange={(e) => setRoomDes(e.target.value)}
                placeholder="Enter room description..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Room Privacy
              </label>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`w-full flex gap-4 p-4 rounded-lg border-2 ${
                    !isPrivate
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      !isPrivate
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  >
                    <Globe size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Public Room
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Anyone can discover and join
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`w-full flex gap-4 p-4 rounded-lg border-2 ${
                    isPrivate
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isPrivate
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  >
                    <Lock size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Private Room
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Invite-only access
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Room Members
                </h2>
              
              </div>

              <div className="space-y-2">
                {roomData.members.filter(m=>m.userId!==roomData.hostId).map((member) => (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-[#18181B] p-4 rounded-lg border dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {member.name}
                            </span>
                            {getRankIcon(member.rank)}
                          </div>
                          <span className="text-xs text-gray-500">
                            Rank #{member.rank}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <button onClick={()=>{handelRemoveMemberClick(member)}} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                           {memToRemove.some(m=>m.id===member.id)?"unselect":"remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button disabled={isUpdating} onClick={()=>{updateRoom();}} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
