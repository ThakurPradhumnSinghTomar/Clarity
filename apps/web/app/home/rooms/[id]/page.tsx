"use client";

import React, { useEffect, useState } from "react";
import {
  Crown,
  Medal,
  AlertTriangle,
} from "lucide-react";
import {
  LeaderboardTab,
  MembersTab,
  PendingRequestsTab,
  RoomHeader,
  RoomStats,
} from "@repo/ui";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { leaveRoom } from "@/lib/helpfulFunctions/roomsRelated/leaveRoom";
import { useRouter } from "next/navigation";
import { RoomData, RoomMember } from "@repo/types";
import { EditRoomModel } from "@repo/ui";
import { motion, AnimatePresence } from "framer-motion";
import { RoomTabs } from "@repo/ui";
import { useRoomData } from "@/lib/hooks/room/useRoomData";


// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isDestructive = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  isDestructive
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                }`}
              >
                <AlertTriangle
                  className={`${
                    isDestructive
                      ? "text-red-600 dark:text-red-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                  size={24}
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isDestructive
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const RoomPage = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "members" | "leaderboard" | "pending requests"
  >("members");
  
  const [reqProcessing, setReqProcessing] = useState(false);
  const [isRoomEditModelOpen, setIsEditModelOpen] = useState(false);
  const [reqIndex, setReqIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  

  const params = useParams();
  const roomId = params.id as string;
  const { roomData, members, isLoading } = useRoomData(roomId);

  const isHost = roomData?.isHost || false;
  const roomCode = roomData?.roomCode || null;
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const router = useRouter();

  

  if (!accessToken) {
    throw new Error("no access token...  ");
  }

  const handleDeleteRoom = () => {
    leaveRoom({ accessToken, roomId, isHost, roomCode });
    router.push("/home/rooms");
  };

  const handleLeaveRoom = () => {
    leaveRoom({ accessToken, roomId, isHost, roomCode });
    router.push("/home/rooms");
  };

  const acceptJoinReq = async () => {
    try {
      const RequserId = roomData?.joinRequests[reqIndex].userId;
      setReqProcessing(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/approve-joinroom-req`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ roomCode, roomId, RequserId }),
        },
      );

      if (!response || !response.ok) {
        console.error("failed to accept the user join request..");
        setReqProcessing(false);
        return;
      }

      setReqProcessing(false);

      console.log("user successfully joined the room... request accepted..");
      return;
    } catch (error) {
      console.error("failed to accept the user join request..", error);
      setReqProcessing(false);
      return;
    }
  };

  const rejectJoinReq = async () => {
    try {
      const RequserId = roomData?.joinRequests[reqIndex].userId;
      setReqProcessing(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/reject-joinroom-req`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ roomCode, roomId, RequserId }),
        },
      );

      if (!response || !response.ok) {
        console.error("failed to reject the user join request..");
        setReqProcessing(false);
        return;
      }

      setReqProcessing(false);

      console.log(
        "user respectfully rejected to join the room... request rejected..",
      );
      return;
    } catch (error) {
      console.error("failed to reject the user join request..", error);
      setReqProcessing(false);
      return;
    }
  };


  // Convert members to leaderboard format
  const leaderboardStudents = members.map((member) => ({
    name: member.name,
    totalHours: member.studyTime / 60, // Convert minutes to hours
    image: undefined, // You can add image URLs here if available
    isFocusing: member.isFocusing,
  }));

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(
      roomData?.roomCode || "some error in copying..",
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    return null;
  };



  function RoomSkeleton() {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-800 rounded-lg animate-pulse mb-4"></div>
          <div className="h-4 w-48 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 w-20 bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-6 mb-6 border-b border-gray-800">
          <div className="h-8 w-24 bg-gray-800 rounded-t animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-800 rounded-t animate-pulse"></div>
        </div>

        {/* Members Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-40 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-indigo-900 rounded-lg animate-pulse"></div>
        </div>

        {/* Member Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-800 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-5 w-32 bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-16 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-16 bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-12 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!roomData) {
    return <div className="text-4xl dark:text-white">{RoomSkeleton()}</div>;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="min-h-screen bg-[#ffffff] dark:bg-[#181E2B] py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <RoomHeader
            name={roomData.name}
            description={roomData.description}
            isHost={isHost}
            onEdit={() => setIsEditModelOpen(true)}
            onDeleteOrLeave={() =>
              isHost ? setShowDeleteConfirm(true) : setShowLeaveConfirm(true)
            }
          />

          <RoomStats
            memberCount={roomData.memberCount + 1}
            totalStudyTime={roomData.totalStudyTime}
            roomCode={roomData.roomCode}
            copiedCode={copiedCode}
            onCopy={handleCopyInviteCode}
          />

          {/* Tabs */}
          <div className="mt-26">
            <RoomTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Content */}
          {activeTab === "members" ? (
            <MembersTab members={members} />
          ) : activeTab === "leaderboard" ? (
            <div className="flex justify-center ">
              <LeaderboardTab students={leaderboardStudents} />
            </div>
          ) : (
            <PendingRequestsTab
              roomData={roomData}
              reqProcessing={reqProcessing}
              onAccept={(index) => {
                setReqIndex(index);
                acceptJoinReq();
              }}
              onReject={(index) => {
                setReqIndex(index);
                rejectJoinReq();
              }}
            />
          )}
        </div>

        <div className="flex justify-center items-center w-full">
          <EditRoomModel
            isOpen={isRoomEditModelOpen}
            roomData={roomData}
            setIsOpen={setIsEditModelOpen}
          ></EditRoomModel>
        </div>
      </motion.div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteRoom}
        title="Delete Room?"
        message="Are you sure you want to delete this room? All members will be removed and this action cannot be undone."
        confirmText="Delete Room"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveRoom}
        title="Leave Room?"
        message="Are you sure you want to leave this room? You'll need a new invite code to rejoin."
        confirmText="Leave Room"
        isDestructive={true}
      />
    </>
  );
};

export default RoomPage;
