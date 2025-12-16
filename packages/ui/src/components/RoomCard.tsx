import React from 'react';
import { Users, Clock, Trophy } from 'lucide-react';

interface RoomCardProps {
  id: string;
  name: string;
  memberCount: number;
  totalStudyTime: number;
  rank?: number;
  lastActive?: string;
  color?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  name,
  memberCount,
  totalStudyTime,
  rank,
  lastActive,
  color = '#6366f1'
}) => {
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-white dark:bg-[#27272A] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: color }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {name}
            </h3>
            {lastActive && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active {lastActive}
              </p>
            )}
          </div>
        </div>
        {rank && (
          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full">
            <Trophy size={16} />
            <span className="text-sm font-medium">#{rank}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Users size={18} />
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Clock size={18} />
          <span>{formatStudyTime(totalStudyTime)} studied</span>
        </div>
      </div>
    </div>
  );
};