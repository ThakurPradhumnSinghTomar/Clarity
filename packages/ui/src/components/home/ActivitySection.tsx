"use client";

import { ClassicLoader } from "@repo/ui";

const getActivityColor = (sec: number) => {
  if (sec === 0) return "bg-gray-100 dark:bg-gray-800";
  if (sec < 30 * 60) return "bg-blue-200 dark:bg-blue-900/40";
  if (sec < 90 * 60) return "bg-blue-400 dark:bg-blue-700";
  return "bg-blue-600 dark:bg-blue-500";
};

export type ActivitySectionProps = {
  isLoading: boolean;
  activityWeeks: Record<number, number[]>;
  currentStreak: number;
  longestStreak: number;
};

export function ActivitySection({
  isLoading,
  activityWeeks,
  currentStreak,
  longestStreak,
}: ActivitySectionProps) {
  return (
    <section className="space-y-4">
      {/* Header with institutional styling */}
      <div className="border-l-4 border-blue-600 pl-4 py-2 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
          Activity Overview
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          8-Week Performance Tracker
        </p>
      </div>

      {/* Main card with academic portal styling */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Card header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 border-b-2 border-blue-700">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
            Student Activity Dashboard
          </h3>
        </div>

        {/* Card body */}
        <div className="p-6">
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <ClassicLoader />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats cards row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Streak */}
                <div className="border-2 border-orange-200 dark:border-orange-800 rounded bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-gray-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🔥</div>
                    <div>
                      <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                        Current Streak
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {currentStreak}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                          day{currentStreak !== 1 && "s"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Best Streak */}
                <div className="border-2 border-yellow-200 dark:border-yellow-800 rounded bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-gray-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🏆</div>
                    <div>
                      <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                        Best Streak
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {longestStreak}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                          days
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Weeks */}
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📊</div>
                    <div>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Tracking Period
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        8
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
                          weeks
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Heatmap section */}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Heatmap grid */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {/* Day labels */}
                      <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 pt-1">
                        <div className="h-4 flex items-center">M</div>
                        <div className="h-4 flex items-center">T</div>
                        <div className="h-4 flex items-center">W</div>
                        <div className="h-4 flex items-center">T</div>
                        <div className="h-4 flex items-center">F</div>
                        <div className="h-4 flex items-center">S</div>
                        <div className="h-4 flex items-center">S</div>
                      </div>

                      {/* Heatmap */}
                      <div className="flex gap-1.5">
                        {Object.entries(activityWeeks).map(([weekIdx, days]) => (
                          <div key={weekIdx} className="flex flex-col gap-1.5">
                            {days.map((focusedSec, dayIdx) => (
                              <div
                                key={dayIdx}
                                title={`${
                                  focusedSec > 0 ? Math.round(focusedSec / 60) : 0
                                } min`}
                                className={`
                                  h-4 w-4 rounded border border-gray-300 dark:border-gray-600
                                  transition-all hover:scale-110 hover:shadow-md cursor-pointer
                                  ${getActivityColor(focusedSec)}
                                `}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                      Activity Level
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Less</span>
                      <div className="flex gap-1.5">
                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800" />
                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-blue-200 dark:bg-blue-900/40" />
                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-blue-400 dark:bg-blue-700" />
                        <div className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-blue-600 dark:bg-blue-500" />
                      </div>
                      <span className="font-medium">More</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}