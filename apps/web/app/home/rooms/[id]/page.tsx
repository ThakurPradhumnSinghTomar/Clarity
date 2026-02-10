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
} from "@repo/ui";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRoomData } from "@/lib/hooks/room/useRoomData";
import { useJoinRequests } from "@/lib/hooks/room/useJoinRequests";
import { useRoomActions } from "@/lib/hooks/room/useRoomActions";
import { useRoomChat } from "@/lib/hooks/room/useRoomChat";

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

  // Route params give us the room id used by all room-specific hooks.
  const params = useParams();
  const roomId = params.id as string;
  // This hook fetches room-level metadata and member details.
  const { roomData, members, isLoading } = useRoomData(roomId);

  // This hook connects room chat UI to backend message APIs and realtime socket events.
  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    isSending: isChatSending,
    error: chatError,
    sendMessage,
    reloadMessages,
  } = useRoomChat(roomId);

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
            <div className="space-y-4">
              {/* Chat-specific loading state keeps UX explicit while backend history is being fetched. */}
              {isChatLoading ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
                  Loading room chat...
                </div>
              ) : (
                <RoomChat
                  messages={chatMessages}
                  onSendMessage={sendMessage}
                  isSending={isChatSending}
                />
              )}

              {/* Chat error state exposes backend failures and offers retry action. */}
              {chatError ? (
                <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
                  <div>{chatError}</div>
                  <button
                    type="button"
                    onClick={reloadMessages}
                    className="mt-2 rounded-md border border-red-400 px-3 py-1 text-xs font-semibold hover:bg-red-100 dark:border-red-500 dark:hover:bg-red-900/40"
                  >
                    Retry
                  </button>
                </div>
              ) : null}
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
