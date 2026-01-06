"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  LogIn,
  Users,
  Target,
  TrendingUp,
  Shield,
  Loader2,
} from "lucide-react";
import { RoomCard, InfoCard, CreateRoomModal, JoinRoomModal } from "@repo/ui";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Room } from "@repo/types";
import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

const RoomsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw error;
  }

  useEffect(() => {
    fetchMyRooms({ setIsLoadingRooms, setError, accessToken, setMyRooms });
  }, [accessToken]);

  /* ================= ACTIONS ================= */

  const handleCreateRoom = async (
    roomName: string,
    isPrivate: boolean,
    roomDescription: string
  ) => {
    setIsCreatingRoom(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: roomName,
            description: roomDescription,
            isPublic: !isPrivate,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(`Room created · Code: ${data.room.roomCode}`);
      setIsCreateModalOpen(false);
      await fetchMyRooms({
        setIsLoadingRooms,
        setError,
        accessToken,
        setMyRooms,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to create room");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (inviteCode: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/join-room`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ roomCode: inviteCode }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      data.joinRequest
        ? toast.info(data.message)
        : toast.success(`Joined ${data.room.name}`);

      setIsJoinModalOpen(false);
      await fetchMyRooms({
        setIsLoadingRooms,
        setError,
        accessToken,
        setMyRooms,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to join room");
    }
  };

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-[#F4F6F8] dark:bg-[#171C28] transition-colors">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 py-12 space-y-16"
      >
        {/* HEADER */}
        <motion.section variants={item} className="space-y-3">
          <h1 className="text-3xl font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
            Study Rooms
          </h1>
          <p className="text-[#64748B] dark:text-[#9FB0C0] max-w-xl">
            Stay consistent together. Track focus, share progress, and build
            momentum with peers.
          </p>
        </motion.section>

        {/* ACTIONS */}
        <motion.section
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <ActionButton
            loading={isCreatingRoom}
            icon={Plus}
            label="Create room"
            onClick={() => setIsCreateModalOpen(true)}
          />
          <ActionButton
            icon={LogIn}
            label="Join room"
            onClick={() => setIsJoinModalOpen(true)}
          />
        </motion.section>

        {/* INFO */}
        <motion.section variants={item} className="space-y-6">
          <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
            Why rooms work
          </h2>
          <motion.div
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[Users, Target, TrendingUp, Shield].map((Icon, i) => (
              <motion.div key={i} variants={item}>
                <InfoCard
                  icon={Icon}
                  title={
                    ["Accountability", "Clarity", "Momentum", "Privacy"][i]
                  }
                  description={
                    [
                      "Stay consistent by studying with others",
                      "Know exactly where your time goes daily",
                      "Consistency compounds faster together",
                      "Invite-only rooms when you need focus",
                    ][i]
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ROOMS */}
        <motion.section variants={item} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
              My rooms
            </h2>
            {!isLoadingRooms && (
              <span className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
                {myRooms.length} rooms
              </span>
            )}
          </div>

          {isLoadingRooms && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-white/60 dark:bg-[#151B22]/60 animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoadingRooms && !error && myRooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {myRooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/home/rooms/${room.id}`)}
                >
                  <RoomCard {...transformRoomData(room)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>
      </motion.div>

      {/* MODALS */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
        isLoading={isCreatingRoom}
      />
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={handleJoinRoom}
      />
    </main>
  );
};

export default RoomsPage;

/* ================= SUB ================= */

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE }}
      onClick={onClick}
      disabled={loading}
      className="
        flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border
        bg-white/70 dark:bg-[#151B22]/70
        border-[#CBD5E1] dark:border-[#334155]
        text-[#0F172A] dark:text-[#E6EDF3]
        disabled:opacity-60
      "
    >
      {loading ? <Loader2 className="animate-spin" /> : <Icon size={20} />}
      {label}
    </motion.button>
  );
}
