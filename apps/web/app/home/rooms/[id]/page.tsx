"use client";

import { useState } from "react";
import {
  LeaderboardTab,
  MembersTab,
  PendingRequestsTab,
  RoomHeader,
  RoomSkeleton,
  RoomStats,
} from "@repo/ui";
import { useParams } from "next/navigation";
import { EditRoomModel } from "@repo/ui";
import { motion } from "framer-motion";
import { RoomTabs } from "@repo/ui";
import { useRoomData } from "@/lib/hooks/room/useRoomData";
import { useJoinRequests } from "@/lib/hooks/room/useJoinRequests";
import { useRoomActions } from "@/lib/hooks/room/useRoomActions";
import { ConfirmationModal } from "@repo/ui";

const RoomPage = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "members" | "leaderboard" | "pending requests"
  >("members");

  const [isRoomEditModelOpen, setIsEditModelOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const params = useParams();
  const roomId = params.id as string;
  const { roomData, members, isLoading } = useRoomData(roomId);

  const isHost = roomData?.isHost || false;
  const roomCode = roomData?.roomCode || null;

  const { isProcessing, acceptRequest, rejectRequest } = useJoinRequests({
    roomId,
    roomCode,
  });

  const { deleteRoom, leaveRoom } = useRoomActions({
    roomId,
    roomCode,
    isHost,
  });


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

  
  if (isLoading) {
    return <RoomSkeleton />;
  }

  if (!roomData) {
    return <p className="text-center mt-20">Room not found</p>;
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
        className="min-h-screen bg-[var(--color-bg)] py-8 px-4 sm:px-6 lg:px-8"
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
              reqProcessing={isProcessing}
              onAccept={(userId) => acceptRequest(userId)}
              onReject={(userId) => rejectRequest(userId)}
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
        onConfirm={deleteRoom}
        title="Delete Room?"
        message="Are you sure you want to delete this room? All members will be removed and this action cannot be undone."
        confirmText="Delete Room"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={leaveRoom}
        title="Leave Room?"
        message="Are you sure you want to leave this room? You'll need a new invite code to rejoin."
        confirmText="Leave Room"
        isDestructive={true}
      />
    </>
  );
};

export default RoomPage;
