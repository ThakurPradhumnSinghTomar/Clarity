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
        <p className="text-sm text-[var(--color-text-muted)]">
          {dailyLabel}'s sessions, split by time of day.
        </p>
      </header>

      <div
        className="
          rounded-3xl border p-8
          bg-[var(--color-surface)] border-[var(--color-border)]
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
                  rounded-2xl border p-4 h-[300px] overflow-y-auto scrollbar-hide
                  bg-[var(--color-surface-elevated)] border-[var(--color-border)]
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
                          bg-[var(--color-surface)]
                          border border-[var(--color-border)]
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
