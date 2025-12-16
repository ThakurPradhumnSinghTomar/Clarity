"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Trophy,
  Clock,
  Settings,
  LogOut,
  Copy,
  Check,
  UserPlus,
  Crown,
  Medal,
} from "lucide-react";
import { Leaderboard } from "@repo/ui";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

 type RoomData = {
  id: string;
  name: string;
  description: string;
  roomCode: string;
  isPublic: boolean;
  isHost: boolean;
  memberCount: number;
  totalStudyTime: number;
  members: RoomMember[];
};


  type RoomMember = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isFocusing: boolean;
  studyTime: number;
  rank: number;
};
 

const RoomPage = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "leaderboard">(
    "members"
  );
const [members, setMembers] = useState<RoomMember[]>([]);

const [roomData, setRoomData] = useState<RoomData | null>(null);

  const params = useParams();
  const roomId = params.id as string;
  const { data: session } = useSession();

  const loadRoomData = async () => {
    try {
      const room = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room/get-room/${roomId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (!room.ok) {
        console.log("failed to load room data");
        return;
      }


      const data = await room.json();

      setRoomData(data.room);
      setMembers(data.room.members);

    } catch (error) {
      console.log("failed to lead room data and its members..",error);
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
    navigator.clipboard.writeText(roomData?.roomCode||"some error in copying..");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    return null;
  };

  useEffect(() => {
  if (session?.accessToken) {
    loadRoomData();
  }
}, [session?.accessToken]);

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
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#000000] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {roomData.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {roomData.description}
              </p>
            </div>
            <div className="flex gap-3">
              {roomData.isHost && (
                <button className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700">
                  <Settings size={20} />
                </button>
              )}
              <button className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Room Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Users
                    className="text-indigo-600 dark:text-indigo-400"
                    size={24}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Members
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {roomData.memberCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Clock
                    className="text-purple-600 dark:text-purple-400"
                    size={24}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Study Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatStudyTime(roomData.totalStudyTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Trophy
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your Rank
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    #1
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Invite Code
                  </p>
                  <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                    {roomData.roomCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyInviteCode}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {copiedCode ? (
                    <Check size={20} className="text-green-500" />
                  ) : (
                    <Copy size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("members")}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === "members"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              Members
              {activeTab === "members" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === "leaderboard"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              Leaderboard
              {activeTab === "leaderboard" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "members" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Room Members
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <UserPlus size={20} />
                <span>Invite</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-[#18181B] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14  flex items-center justify-center text-2xl shadow-md overflow-hidden rounded-full">
                          <img src={member.avatar} alt="user profile" className="" />
                        </div>
                        {member.isFocusing && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#18181B] rounded-full animate-pulse" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                            {member.name}
                          </h3>
                          {member.rank <= 3 && getRankIcon(member.rank)}
                        </div>

                        {member.isFocusing ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Focusing now 🔥
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            Offline
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <Clock
                          size={16}
                          className="text-gray-400 dark:text-gray-500"
                        />
                        <span className="font-semibold text-sm">
                          {formatStudyTime(member.studyTime)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                        Rank #{member.rank}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Leaderboard students={leaderboardStudents} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
