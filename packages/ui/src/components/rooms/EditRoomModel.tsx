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
    if (rank === 2) return <Medal className="text-[var(--color-text-subtle)]" size={20} />;
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
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto scrollbar-hide">
      {/* 🔹 Centering wrapper */}
      <div className="min-h-screen flex justify-center p-4">
        {/* 🔹 Modal */}
        <div className="bg-[var(--color-surface)] w-[400px] rounded-lg flex flex-col my-10 text-[var(--color-text)]">
          {/* Header */}
          <div className="flex justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Update Your Room
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)]"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Room Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)]"
              />
            </div>

            {/* Room Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Room Description
              </label>
              <input
                type="text"
                value={roomDes}
                onChange={(e) => setRoomDes(e.target.value)}
                placeholder="Enter room description..."
                className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)]"
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-3">
                Room Privacy
              </label>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`w-full flex gap-4 p-4 rounded-lg border-2 ${
                    !isPrivate
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "border-[var(--color-border-strong)]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      !isPrivate
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    <Globe size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-[var(--color-text)]">
                      Public Room
                    </h4>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Anyone can discover and join
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`w-full flex gap-4 p-4 rounded-lg border-2 ${
                    isPrivate
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "border-[var(--color-border-strong)]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isPrivate
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-muted)]"
                    }`}
                  >
                    <Lock size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-[var(--color-text)]">
                      Private Room
                    </h4>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Invite-only access
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  Room Members
                </h2>
              
              </div>

              <div className="space-y-2">
                {roomData.members.filter(m=>m.userId!==roomData.hostId).map((member) => (
                  <div
                    key={member.id}
                    className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--color-text)]">
                              {member.name}
                            </span>
                            {getRankIcon(member.rank)}
                          </div>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            Rank #{member.rank}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-1">
                        <button onClick={()=>{handelRemoveMemberClick(member)}} className="px-2 py-1 bg-[var(--color-accent-red)] text-black rounded hover:opacity-90">
                           {memToRemove.some(m=>m.id===member.id)?"unselect":"remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button disabled={isUpdating} onClick={()=>{updateRoom();}} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-strong)]">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
