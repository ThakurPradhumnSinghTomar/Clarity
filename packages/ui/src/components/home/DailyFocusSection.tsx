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
    <section className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold">Daily Focus</h2>
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
          {dailyLabel}'s sessions, split by time of day.
        </p>
      </header>

      <div
        className="
          rounded-3xl border p-8
          bg-white border-[#E2E8F0]
          dark:bg-[#151B22] dark:border-[#1F2933]
        "
      >
        {isLoading ? (
          <div className="h-[240px] flex items-center justify-center">
            <ClassicLoader />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(["Morning", "Day", "Night"] as const).map((bucket) => (
              <div
                key={bucket}
                className="
                  rounded-2xl border p-4
                  bg-[#F8FAFC] border-[#E2E8F0]
                  dark:bg-[#0F1419] dark:border-[#1F2933]
                "
              >
                <h3 className="font-medium mb-3">{bucket}</h3>

                {dailySessions[bucket].length === 0 ? (
                  <p className="text-sm opacity-60">No sessions</p>
                ) : (
                  <div className="space-y-2">
                    {dailySessions[bucket].map((s) => (
                      <div
                        key={s.id}
                        className="
                          flex justify-between items-center
                          rounded-xl px-3 py-2
                          bg-white dark:bg-[#151B22]
                          border border-[#E2E8F0] dark:border-[#1F2933]
                          text-sm
                        "
                      >
                        <span>
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

                        <span className="opacity-70">
                          {Math.round(s.durationSec / 60)} min
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
