import React from 'react';

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
    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl p-5 border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white dark:hover:bg-neutral-900 transition-all duration-200 hover:shadow-sm cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-base"
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 tracking-tight">
              {name}
            </h3>
            {lastActive && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Active {lastActive}
              </p>
            )}
          </div>
        </div>
        {rank && (
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-2.5 py-1 rounded-lg">
            <span className="text-xs font-medium">#{rank}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>{formatStudyTime(totalStudyTime)} studied</span>
        </div>
      </div>
    </div>
  );
};