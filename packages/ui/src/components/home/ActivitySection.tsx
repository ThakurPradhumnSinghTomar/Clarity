"use client";

import { ClassicLoader } from "@repo/ui";


const getActivityColor = (sec: number) => {
  if (sec === 0) return "bg-[#E5E7EB] dark:bg-[#1F2933]";
  if (sec < 30 * 60) return "bg-[#C7D2FE]";
  if (sec < 90 * 60) return "bg-[#818CF8]";
  return "bg-[#4F6EF7]";
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
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Activity</h2>
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
          Your consistency over the last 8 weeks.
        </p>
      </header>

      <div
        className="
          rounded-3xl border p-6
          bg-white border-[#E2E8F0]
          dark:bg-[#151B22] dark:border-[#1F2933]
        "
      >
        {isLoading ? (
          <div className="h-[140px] flex items-center justify-center">
            <ClassicLoader />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* HEATMAP */}
            <div className="flex gap-1">
              {Object.entries(activityWeeks).map(([weekIdx, days]) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {days.map((focusedSec, dayIdx) => (
                    <div
                      key={dayIdx}
                      title={`${
                        focusedSec > 0
                          ? Math.round(focusedSec / 60)
                          : 0
                      } min`}
                      className={`
                        h-4 w-4 rounded-sm
                        ${getActivityColor(focusedSec)}
                      `}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* STATS */}
            <div className="space-y-6 flex justify-around w-full items-center">
              <div>
                <p className="text-sm text-[#9FB0C0]">Current streak</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  🔥 {currentStreak} day
                  {currentStreak !== 1 && "s"}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#9FB0C0]">Best streak</p>
                <p className="text-lg font-medium flex items-center gap-2">
                  🏆 {longestStreak} days
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide opacity-60 mb-2">
                  Activity level
                </p>
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="h-3 w-3 rounded-sm bg-[#1F2933]" />
                    <div className="h-3 w-3 rounded-sm bg-[#C7D2FE]" />
                    <div className="h-3 w-3 rounded-sm bg-[#818CF8]" />
                    <div className="h-3 w-3 rounded-sm bg-[#4F6EF7]" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
