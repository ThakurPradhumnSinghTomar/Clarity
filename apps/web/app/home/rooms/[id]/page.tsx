"use client";

import { useState } from "react";
import {
  LeaderboardTab,
  MembersTab,
  PendingRequestsTab,
  RoomHeader,
  RoomSkeleton,
  RoomStats,
  RoomTabs,
  EditRoomModel,
  ConfirmationModal,
  RoomChat,
  type RoomTab,
  type RoomChatMessage,
} from "@repo/ui";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRoomData } from "@/lib/hooks/room/useRoomData";
import { useJoinRequests } from "@/lib/hooks/room/useJoinRequests";
import { useRoomActions } from "@/lib/hooks/room/useRoomActions";

const RoomPage = () => {
  // This state drives a temporary "copied" visual feedback for the invite-code copy action.
  const [copiedCode, setCopiedCode] = useState(false);
  // This state tracks which tab content should be rendered in the room page body.
  const [activeTab, setActiveTab] = useState<RoomTab>("members");

  // This state toggles the room edit modal visibility.
  const [isRoomEditModelOpen, setIsEditModelOpen] = useState(false);
  // This state toggles the host delete confirmation modal.
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // This state toggles the member leave confirmation modal.
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // This local state stores in-memory chat messages until backend chat APIs are integrated.
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([
    {
      id: "welcome-1",
      senderName: "FocusFlow Bot",
      text: "Welcome to the room chat! Share goals, blockers, and wins with your team.",
      createdAt: new Date().toISOString(),
      isCurrentUser: false,
    },
  ]);

  // Route params give us the room id used by all room-specific hooks.
  const params = useParams();
  const roomId = params.id as string;
  // This hook fetches room-level metadata and member details.
  const { roomData, members, isLoading } = useRoomData(roomId);

  // Host flag controls privileged actions such as delete and edit.
  const isHost = roomData?.isHost || false;
  // Room code is used for room-related API operations.
  const roomCode = roomData?.roomCode || null;

  // This hook handles pending-request moderation actions.
  const { isProcessing, acceptRequest, rejectRequest } = useJoinRequests({
    roomId,
    roomCode,
  });

  // This hook exposes side-effect actions for room deletion and leaving.
  const { deleteRoom, leaveRoom } = useRoomActions({
    roomId,
    roomCode,
    isHost,
  });

  // We transform members into the expected leaderboard UI contract.
  const leaderboardStudents = members.map((member) => ({
    name: member.name,
    totalHours: member.studyTime / 60,
    image: undefined,
    isFocusing: member.isFocusing,
  }));

  // This handler copies invite code and resets the transient success state after a short delay.
  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(
      roomData?.roomCode || "some error in copying..",
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // This handler appends a new optimistic local chat message for the current user.
  const handleSendMessage = (message: string) => {
    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        id: crypto.randomUUID(),
        senderName: "You",
        text: message,
        createdAt: new Date().toISOString(),
        isCurrentUser: true,
      },
    ]);
  };

  // We render the skeleton while room data is still loading.
  if (isLoading) {
    return <RoomSkeleton />;
  }

  // If the room lookup fails, we return a fallback state.
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
        className="min-h-screen bg-[#ffffff] dark:bg-[#181E2B] py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header contains room metadata and primary room actions. */}
          <RoomHeader
            name={roomData.name}
            description={roomData.description}
            isHost={isHost}
            onEdit={() => setIsEditModelOpen(true)}
            onDeleteOrLeave={() =>
              isHost ? setShowDeleteConfirm(true) : setShowLeaveConfirm(true)
            }
          />

          {/* Stats surface quick room insights and invite-copy interaction. */}
          <RoomStats
            memberCount={roomData.memberCount + 1}
            totalStudyTime={roomData.totalStudyTime}
            roomCode={roomData.roomCode}
            copiedCode={copiedCode}
            onCopy={handleCopyInviteCode}
          />

          {/* Tabs expose the main functional sections for this room. */}
          <div className="mt-26">
            <RoomTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Content panel renders per selected tab to keep concerns separated. */}
          {activeTab === "members" ? (
            <MembersTab members={members} />
          ) : activeTab === "leaderboard" ? (
            <div className="flex justify-center ">
              <LeaderboardTab students={leaderboardStudents} />
            </div>
          ) : activeTab === "chat" ? (
            <RoomChat messages={chatMessages} onSendMessage={handleSendMessage} />
          ) : (
            <PendingRequestsTab
              roomData={roomData}
              reqProcessing={isProcessing}
              onAccept={(userId) => acceptRequest(userId)}
              onReject={(userId) => rejectRequest(userId)}
            />
          )}
        </div>

        {/* Edit modal is mounted at page level so it can be triggered from header actions. */}
        <div className="flex justify-center items-center w-full">
          <EditRoomModel
            isOpen={isRoomEditModelOpen}
            roomData={roomData}
            setIsOpen={setIsEditModelOpen}
          ></EditRoomModel>
        </div>
      </motion.div>

      {/* Confirmation modal for host-driven room deletion action. */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteRoom}
        title="Delete Room?"
        message="Are you sure you want to delete this room? All members will be removed and this action cannot be undone."
        confirmText="Delete Room"
        isDestructive={true}
      />

      {/* Confirmation modal for member-driven room leave action. */}
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
