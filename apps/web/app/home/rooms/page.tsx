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
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const { data: session } = useSession();
  const router = useRouter()
  // Loading states
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = session?.accessToken;
  if(!accessToken){
    console.log("no access token in the session..")
    throw error}

  // Fetch rooms on component mount
  useEffect(() => {
    if (session?.accessToken) {
      fetchMyRooms({setIsLoadingRooms, setError, accessToken, setMyRooms });
    }
  }, [session]);

  

  // Loading skeleton for room cards
  const RoomCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#232630] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
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
            {!isLoading && (
              <span className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
                {rooms.length} rooms
              </span>
            )}
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-white/60 dark:bg-[#151B22]/60 animate-pulse"
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
              )):<p className="text-md  text-[#0F172A] dark:text-[#bec3c8]">No rooms joined yet</p>}
            </motion.div>
          )}
        </motion.section>
      </motion.div>

      {/* Modals */}
     
     
    </div>
  );
};

export default RoomsPage;
