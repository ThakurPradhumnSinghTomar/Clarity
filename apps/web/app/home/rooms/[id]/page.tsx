"use client";

import { useEffect, useRef, useState } from "react";
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
import { useSession } from "next-auth/react";
import { useRoomData } from "@/lib/hooks/room/useRoomData";
import { useJoinRequests } from "@/lib/hooks/room/useJoinRequests";
import { useRoomActions } from "@/lib/hooks/room/useRoomActions";
import {
  useJoinRoomChat,
  useRoomMessages,
} from "@/lib/hooks/sockets/useSockets";
import { socket } from "@/lib/socket";
import { useRoomCamera } from "@/lib/hooks/sockets/useRoomCamera";


// Reusable tile that binds a MediaStream to a <video> tag.
// We keep this tiny because room can render multiple local/remote feeds.
const VideoTile = ({
  stream,
  label,
  muted = false,
}: {
  stream: MediaStream;
  label: string;
  muted?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-black/90">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full aspect-video object-cover"
      />
      <div className="px-3 py-2 text-xs text-white/80 bg-black/50">{label}</div>
    </div>
  );
};

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

  // Route params give us the room id used by all room-specific hooks.
  const params = useParams();
  const roomId = params.id as string;
  useJoinRoomChat(roomId);

  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  const { messages } = useRoomMessages({
    roomId,
    currentUserId,
  });

  // Camera sharing state + controls from our WebRTC hook.
  // localStream is your own camera preview; remoteStreams are other members.
  const {
    isSharing,
    startSharing,
    stopSharing,
    localStream,
    remoteStreams,
    error: cameraError,
  } = useRoomCamera({ roomId });


  // This hook fetches room-level metadata and member details.
  const { roomData, setRoomData, members, setMembers, isLoading  } = useRoomData(roomId);

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

  //eofnoe
  // This handler appends a new optimistic local chat message for the current user.
  const handleSendMessage = (message: string) => {
    if (!currentUserId) return;

    socket.emit("send_message", {
      roomId,
      message,
      senderId: currentUserId,
      senderName: session?.user?.name || "You",
    });
  };

useEffect(() => {
  const handleFocusingChange = ({
    userId,
    isFocusing,
  }: {
    userId: string;
    isFocusing: boolean;
  }) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.userId === userId ? { ...member, isFocusing } : member,
      ),
    );

    setRoomData((prevRoomData) => {
      if (!prevRoomData) return prevRoomData;

      return {
        ...prevRoomData,
        members: prevRoomData.members.map((member) =>
          member.userId === userId ? { ...member, isFocusing } : member,
        ),
      };
    });
  };

  socket.on("user_focusing_changed", handleFocusingChange);

  return () => {
    socket.off("user_focusing_changed", handleFocusingChange);
  };
}, [setMembers, setRoomData]);
  // USEEFFECT KE ANDAR KAFI HOOKS USE NHI KRTE 

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
            memberCount={roomData.memberCount}
            totalStudyTime={roomData.totalStudyTime}
            roomCode={roomData.roomCode}
            copiedCode={copiedCode}
            onCopy={handleCopyInviteCode}
          />

          {/*
            Optional in-room camera share controls.
            Users can explicitly opt-in/out at any time while in the room.
          */}
          <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Focus camera sharing (low quality)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Share your camera feed with room members while focusing. You
                  can toggle anytime.
                </p>
              </div>
              <button
                onClick={() => (isSharing ? stopSharing() : startSharing())}
                className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {isSharing ? "Turn camera off" : "Turn camera on"}
              </button>
            </div>

            {cameraError && (
              <p className="mt-3 text-xs text-red-500">{cameraError}</p>
            )}

            {/* Render a responsive feed grid only when at least one stream exists. */}
            {(localStream || remoteStreams.length > 0) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {localStream && (
                  <VideoTile stream={localStream} muted={true} label="You" />
                )}
                {remoteStreams.map((remote) => (
                  <VideoTile
                    key={remote.socketId}
                    stream={remote.stream}
                    label={`Peer ${remote.socketId.slice(0, 6)}`}
                  />
                ))}
              </div>
            )}
          </div>


          {/* Tabs expose the main functional sections for this room. */}
          <div className="mt-26">
            <RoomTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              isHost={isHost}
            />
          </div>

          {/* Content panel renders per selected tab to keep concerns separated. */}
          {activeTab === "members" ? (
            <MembersTab members={members} />
          ) : activeTab === "leaderboard" ? (
            <div className="flex justify-center">
              <LeaderboardTab students={leaderboardStudents} />
            </div>
          ) : activeTab === "chat" ? (
            <RoomChat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId={currentUserId}
            />
          ) : activeTab === "pending requests" && isHost ? (
            <PendingRequestsTab
              roomData={roomData}
              reqProcessing={isProcessing}
              onAccept={(userId) => acceptRequest(userId)}
              onReject={(userId) => rejectRequest(userId)}
            />
          ) : (
            <div className="text-center text-sm opacity-60 mt-10">
              You are not authorized to view this section.
            </div>
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
