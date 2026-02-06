"use client";

import { Users, Clock, Trophy, Copy, Check } from "lucide-react";

export function formatStudyTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

type RoomStatsProps = {
  memberCount: number;
  totalStudyTime: number;
  roomCode: string;
  copiedCode: boolean;
  onCopy: () => void;
};

export function RoomStats({
  memberCount,
  totalStudyTime,
  roomCode,
  copiedCode,
  onCopy,
}: RoomStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Members */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {memberCount}
            </p>
          </div>
        </div>
      </div>

      {/* Total Study Time */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Clock className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Study Time
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatStudyTime(totalStudyTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Rank (static for now) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Trophy className="text-green-600 dark:text-green-400" size={24} />
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

      {/* Invite Code */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Invite Code
            </p>
            <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
              {roomCode}
            </p>
          </div>
          <button
            onClick={onCopy}
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
  );
}
