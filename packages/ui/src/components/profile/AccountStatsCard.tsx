"use client";

interface AccountStatsCardProps {
  totalFocusSessions: number;
  totalStudySeconds: number;
}

export function AccountStatsCard({
  totalFocusSessions,
  totalStudySeconds,
}: AccountStatsCardProps) {
  const formatStudyTime = (seconds: number) => {
    const totalMinutes = Math.round(seconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h > 0 && m > 0) return `${h} hour ${m} minutes studied`;
    if (h > 0) return `${h} hours studied`;
    return `${m} minutes studied`;
  };

  return (
    <div className="mt-6 bg-gray-50 dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Account Statistics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Focus Sessions */}
        <div className="bg-white dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Focus Sessions
          </p>
          <p className="font-semibold text-gray-900 dark:text-white mt-1">
            {totalFocusSessions}
          </p>
        </div>

        {/* Study Time */}
        <div className="bg-white dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hours Focused
          </p>
          <p className="font-semibold text-gray-900 dark:text-white mt-1">
            {formatStudyTime(totalStudySeconds)}
          </p>
        </div>

        {/* Streak */}
        <div className="bg-white dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current Streak
          </p>
          <p className="font-semibold text-gray-900 dark:text-white mt-1">
            currently unavailable
          </p>
        </div>
      </div>
    </div>
  );
}
