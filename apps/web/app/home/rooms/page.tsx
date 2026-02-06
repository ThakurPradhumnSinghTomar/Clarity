"use client";

import { useState } from "react";
import {
  Plus,
  LogIn,
  Users,
  Target,
  TrendingUp,
  Shield,
} from "lucide-react";
import { RoomCard, InfoCard, CreateRoomModal, JoinRoomModal, ActionButton } from "@repo/ui";
import { useRouter } from "next/navigation";
import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { motion } from "framer-motion";
import { useMyRooms } from "@/lib/hooks/rooms/useMyRooms";
import { useRoomMutations } from "@/lib/hooks/rooms/useRoomMutations";

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
  const router = useRouter();

  const { rooms, isLoading, refetch } = useMyRooms();

  const { createRoom, joinRoom, isCreating } =
  useRoomMutations(refetch);

  

  return (
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 py-12 space-y-16"
      >
        {/* HEADER */}
        <motion.section variants={item} className="space-y-3">
          <h1 className="text-3xl font-semibold text-[var(--color-text)]">
            Study Rooms
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-xl">
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
            loading={isCreating}
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
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
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
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              My rooms
            </h2>
            {!isLoading && (
              <span className="text-sm text-[var(--color-text-muted)]">
                {rooms.length} rooms
              </span>
            )}
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-[var(--color-surface)]/60 animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {rooms.length>0?rooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/home/rooms/${room.id}`)}
                >
                  <RoomCard {...transformRoomData(room)} />
                </motion.div>
              )):<p className="text-md text-[var(--color-text)]">No rooms joined yet</p>}
            </motion.div>
          )}
        </motion.section>
      </motion.div>

      {/* MODALS */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createRoom}
        isLoading={isCreating}
      />
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={joinRoom}
      />
    </main>
  );
};

export default RoomsPage;
