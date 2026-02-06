"use client";

import { motion } from "framer-motion";
import { Histogram } from "@repo/ui";
import {ClassicLoader } from "@repo/ui";

/* ---------------- Skeleton ---------------- */

const HistogramSkeleton = () => (
  <div className="w-full min-h-[480px] rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] backdrop-blur-xl shadow-sm p-8 flex justify-center items-center">
    <ClassicLoader />
  </div>
);

function getCurrentDayNumber(): number {
  const day = new Date().getDay(); 
  return day === 0 ? 7 : day - 1;
}




/* ---------------- Icons ---------------- */

const ArrowLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export type WeeklyFocusProps = {
  data: number[];
  meta : {
    weekStart : Date
  }

  isLoading: boolean;
  noData: boolean;

  histogramPage: number;
  stopNext: boolean;
  availableTags: string[];
  selectedTag: string;
  tagContributionMap: Record<string, number>;

  onNextWeek: () => void;
  onPrevWeek: () => void;
  onTagSelect: (tag: string) => void;
};

export function WeeklyFocus({
  data,
  meta,
  isLoading,
  noData,
  histogramPage,
  stopNext,
  availableTags,
  selectedTag,
  tagContributionMap,
  onNextWeek,
  onPrevWeek,
  onTagSelect,
}: WeeklyFocusProps) {
  return (
    <div>
        <section className="space-y-8">
        <header>
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">Weekly Focus</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Your actual work, not intentions.
          </p>
        </header>

        <div
          className="
            relative rounded-3xl border lg:p-8
            bg-[var(--color-surface)] border-[var(--color-border)] min-h-[520px]
          "
        >
          <div className="">
            <div className="grid grid-cols-1 lg:grid-cols-[75%_25%] gap-6">
              <div className="relative">
                <div>
                  {isLoading ? (
                    <HistogramSkeleton />
                  ) : noData ? (
                    <div>
                      <div className="h-[460px] flex text-center items-center justify-center text-sm opacity-70 leading-loose border border-[var(--color-border)] rounded-2xl">
                        No study data this week <br /> Start your study session
                        now
                      </div>
                    </div>
                  ) : (
                    <Histogram
                      data={data}
                      meta={meta}
                      currentDay={getCurrentDayNumber()}
                      isCurrentWeek={histogramPage === 0}
                    />
                  )}
                </div>
                <div className="absolute z-10 flex justify-between w-full">
                  <div className="">
                    <button
                      onClick={() => onNextWeek()}
                      disabled={stopNext}
                      className={`
                      -translate-y-1/2 z-10
                      h-9 w-9 rounded-full border
                      flex items-center justify-center
                      bg-[var(--color-surface)] border-[var(--color-border)]

                      ${
                        stopNext
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-[var(--color-surface-elevated)] cursor-pointer"
                      }
                    `}
                    >
                      <ArrowLeftIcon />
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() =>
                        onPrevWeek()
                      }
                      disabled={histogramPage === 0}
                      className={`
                        -translate-y-1/2
                        h-9 w-9 rounded-full border
                        flex items-center justify-center
                        bg-[var(--color-surface)] border-[var(--color-border)]

                        ${
                          histogramPage === 0
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-[var(--color-surface-elevated)] cursor-pointer"
                        }
                      `}
                    >
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              </div>
              <div className="">
                <div className="mt-2 flex-col justify-between">
                  <div className="flex lg:flex-col gap-3 overflow-x-auto lg:h-[380px] overflow-y-auto scrollbar-hide px-1">
                    {["All Tags", ...availableTags, "untagged"].map((tag) => {
                      const isActive = selectedTag === tag;
                      const contribution =
                        tag === "All Tags"
                          ? 100
                          : (tagContributionMap[tag] ?? 0);

                      return (
                        <motion.button
                          key={tag}
                          onClick={() => onTagSelect(tag)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          className={`
                        px-4 py-2 rounded-2xl text-sm whitespace-nowrap
                        border transition-all cursor-pointer
                        ${
                          isActive
                            ? "bg-[var(--color-primary)] text-white border-transparent shadow-md"
                            : "bg-[var(--color-surface)]/70 text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]"
                        }
                      `}
                        >
                          {tag}
                          {selectedTag == "All Tags" ? (
                            <div></div>
                          ) : (
                            <div>
                              {
                                <div className="mt-1 text-[11px] opacity-70">
                                  {contribution > 0
                                    ? `${contribution}% of week`
                                    : "No contribution"}
                                </div>
                              }
                              <div className="w-full h-1 mt-1 rounded bg-black/10 dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-current transition-all"
                                  style={{ width: `${contribution}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="text-[var(--color-text-muted)] p-4 pt-4">
                    <p>
                      Select above tags and check how much they contributed to
                      your studies
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
