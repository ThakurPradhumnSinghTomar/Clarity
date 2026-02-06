"use client";

import { Clock, Crown, Medal } from "lucide-react";
import { RoomMember } from "@repo/types";

export function formatStudyTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

type MembersTabProps = {
  members: RoomMember[];
};

export function MembersTab({ members }: MembersTabProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Room Members
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-[#18181B] rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 flex items-center justify-center text-2xl shadow-md overflow-hidden rounded-full">
                    <img
                      src={member.avatar}
                      alt="user profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {member.isFocusing && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#18181B] rounded-full animate-pulse" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
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

              {/* Right */}
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
  );
}
