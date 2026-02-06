"use client";

import { ClassicLoader } from "@repo/ui";

export type FocusSession = {
  id: string;
  startTime: string;
  endTime: string | null;
  durationSec: number;
};

export type DailyFocusSectionProps = {
  isLoading: boolean;
  dailyLabel: "Today" | "Yesterday";
  dailySessions: {
    Morning: FocusSession[];
    Day: FocusSession[];
    Night: FocusSession[];
  };
};

export function DailyFocusSection({
  isLoading,
  dailyLabel,
  dailySessions,
}: DailyFocusSectionProps) {
  return (
    <section className="space-y-4">
      {/* Header with institutional styling */}
      <div className="border-l-4 border-green-600 pl-4 py-2 bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
          Daily Focus
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {dailyLabel}'s sessions, split by time of day.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Card header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 border-b-2 border-green-700">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
            Study Sessions Dashboard
          </h3>
        </div>

        {/* Card body */}
        <div className="p-6">
          {isLoading ? (
            <div className="h-[240px] flex items-center justify-center">
              <ClassicLoader />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(["Morning", "Day", "Night"] as const).map((bucket) => (
                <div
                  key={bucket}
                  className="
                    border-2 border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-800
                  "
                >
                  {/* Bucket header */}
                  <div className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 px-4 py-3">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                      {bucket}
                    </h3>
                  </div>

                  {/* Sessions list */}
                  <div className="p-4">
                    {dailySessions[bucket].length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                        No sessions
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dailySessions[bucket].map((s) => (
                          <div
                            key={s.id}
                            className="
                              flex justify-between items-center
                              px-3 py-2
                              bg-white dark:bg-gray-900
                              border-2 border-gray-200 dark:border-gray-700
                              text-sm
                              hover:border-green-400 dark:hover:border-green-600
                              transition-all
                            "
                          >
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {new Date(s.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" - "}
                              {s.endTime
                                ? new Date(s.endTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Ongoing"}
                            </span>

                            <span className="font-bold text-gray-600 dark:text-gray-400">
                              {Math.round(s.durationSec / 60)} min
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}