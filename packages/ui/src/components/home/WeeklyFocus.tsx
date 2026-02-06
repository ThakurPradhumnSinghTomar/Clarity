"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Histogram } from "@repo/ui";
import { ClassicLoader } from "@repo/ui";

/* ---------------- Skeleton ---------------- */

const HistogramSkeleton = () => (
  <div className="w-full min-h-[480px] rounded-lg bg-gray-50 dark:bg-[#1a1d29] p-8 flex justify-center items-center border border-gray-200 dark:border-[#2a2d3a]">
    <ClassicLoader />
  </div>
);

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

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BarChartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

export type WeeklyFocusProps = {
  data: number[];
  currentDay: number;

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
  currentDay,
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
  const weekStatus =
    histogramPage === 0
      ? "Current Week"
      : `Week ${histogramPage} ${histogramPage === 1 ? "ago" : "weeks ago"}`;

  return (
    <section className="space-y-4">
      {/* Header Section - Clean and Professional */}
      <div className="bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a] p-4 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white">
              <BarChartIcon />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Weekly Focus
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your study progress and performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#252836] rounded-lg border border-gray-200 dark:border-[#2a2d3a]">
              <CalendarIcon />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {weekStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Histogram Section */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a]">
          <div className="p-4 md:p-6">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-[#2a2d3a]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Study Activity
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={onNextWeek}
                  disabled={stopNext}
                  className={`
                    h-8 w-8 rounded-md border flex items-center justify-center
                    transition-all duration-200
                    ${
                      stopNext
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-[#252836] dark:border-[#2a2d3a]"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 dark:bg-[#252836] dark:border-[#2a2d3a] dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-500"
                    }
                  `}
                >
                  <ArrowLeftIcon />
                </button>
                <button
                  onClick={onPrevWeek}
                  disabled={histogramPage === 0}
                  className={`
                    h-8 w-8 rounded-md border flex items-center justify-center
                    transition-all duration-200
                    ${
                      histogramPage === 0
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-[#252836] dark:border-[#2a2d3a]"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 dark:bg-[#252836] dark:border-[#2a2d3a] dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-500"
                    }
                  `}
                >
                  <ArrowRightIcon />
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={histogramPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? (
                  <HistogramSkeleton />
                ) : noData ? (
                  <div className="h-[460px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg border-gray-300 dark:border-[#2a2d3a] bg-gray-50 dark:bg-[#252836]">
                    <div className="text-center space-y-3 p-6">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 dark:bg-[#2a2d3a] flex items-center justify-center">
                        <BarChartIcon />
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                          No Data Available
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Start studying to see your weekly progress
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Histogram
                    data={data}
                    currentDay={currentDay}
                    isCurrentWeek={histogramPage === 0}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Tags Filter Section */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a]">
          <div className="p-4 md:p-6">
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#2a2d3a]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Filter by Subject
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Select to view contribution
              </p>
            </div>

            {/* Tags List */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#2a2d3a] scrollbar-track-transparent">
              {["All Tags", ...availableTags, "untagged"].map((tag) => {
                const isActive = selectedTag === tag;
                const contribution =
                  tag === "All Tags" ? 100 : tagContributionMap[tag] ?? 0;

                return (
                  <motion.button
                    key={tag}
                    onClick={() => onTagSelect(tag)}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full text-left px-4 py-3 rounded-md border transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500"
                          : "bg-white border-gray-200 text-gray-700 hover:border-blue-600 hover:bg-blue-50 dark:bg-[#252836] dark:border-[#2a2d3a] dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-[#2a2d3a]"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">
                        {tag === "untagged"
                          ? "Untagged"
                          : tag === "All Tags"
                          ? "All Subjects"
                          : tag}
                      </span>
                      {tag !== "All Tags" && (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {contribution}%
                        </span>
                      )}
                    </div>

                    {tag !== "All Tags" && (
                      <div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-[#2a2d3a] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${contribution}%` }}
                            transition={{ duration: 0.4 }}
                            className={`h-full rounded-full ${
                              isActive
                                ? "bg-white"
                                : "bg-blue-600 dark:bg-blue-500"
                            }`}
                          />
                        </div>
                        <p
                          className={`text-[10px] mt-1 ${
                            isActive
                              ? "text-white/80"
                              : "text-gray-500 dark:text-gray-500"
                          }`}
                        >
                          {contribution > 0
                            ? "Contribution this week"
                            : "No activity"}
                        </p>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-md">
              <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
                <span className="font-semibold">Note:</span> Select a subject
                to view its weekly contribution percentage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                Total Hours
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {!isLoading && !noData
                  ? (data.reduce((a, b) => a + b, 0) / 60).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                Active Days
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {!isLoading && !noData
                  ? data.filter((d) => d > 0).length
                  : "0"}
                <span className="text-sm text-gray-500">/7</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                Avg Per Day
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {!isLoading && !noData
                  ? (
                      data.reduce((a, b) => a + b, 0) /
                      7 /
                      60
                    ).toFixed(1)
                  : "0.0"}
                <span className="text-sm text-gray-500">h</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}