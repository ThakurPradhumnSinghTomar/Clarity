"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface HistogramProps {
  data: number[];
  currentDay: number;
  isCurrentWeek: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatStudyTime = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m studied`;
  if (h > 0) return `${h}h studied`;
  return `${m}m studied`;
};

export default function Histogram({ data, currentDay }: HistogramProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const max = useMemo(() => Math.max(...data, 10), [data]);

  const totalWeekHours = useMemo(
    () => data.reduce((sum, h) => sum + h, 0),
    [data]
  );

  const avgDailyHours = totalWeekHours / 7;

  const MAX_BAR_HEIGHT = 200;
  const MIN_BAR_HEIGHT = 6;

  const getBarHeight = (value: number) => {
    if (value === 0) return 0;
    const scaled = (value / max) * MAX_BAR_HEIGHT;
    return Math.max(scaled, MIN_BAR_HEIGHT);
  };

  return (
    <div className="
      w-full
      rounded-2xl
      border
      border-neutral-200 dark:border-neutral-800
      bg-neutral-50 dark:bg-[#272A34]
      p-6
      text-neutral-900 dark:text-white
      px-10
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">
            Weekly Study Hours
          </h3>
          <p className="text-sm text-neutral-600 dark:text-white/60">
            Track your focus over the week
          </p>
        </div>

        <div className="
          flex items-center gap-2
          rounded-full
          px-4 py-2
          bg-neutral-900 text-white
          dark:bg-white dark:text-black
          text-sm font-medium
        ">
          <TrendingUp size={16} />
          {totalWeekHours.toFixed(1)}h total
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-4 h-[240px] pb-6">
        {data.map((value, i) => {
          const isActive = hovered === i || selected === i;
          const isToday = i === currentDay;

          return (
            <div
              key={i}
              className="relative flex-1 flex flex-col items-center justify-end"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="
                      absolute -top-8
                      rounded-md
                      bg-neutral-900 text-white
                      dark:bg-white dark:text-black
                      px-2 py-1
                      text-xs font-medium
                      whitespace-nowrap
                    "
                  >
                    {formatStudyTime(value)}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar */}
              <motion.div
                layout
                initial={{ height: 0 }}
                animate={{ height: getBarHeight(value) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`
                  w-full
                  rounded-t-lg
                  cursor-pointer
                  ${isToday
                    ? "bg-neutral-900 dark:bg-white"
                    : "bg-neutral-700 dark:bg-white/70"}
                  ${isActive ? "opacity-100" : "opacity-70"}
                `}
              />

              {/* Day */}
              <span
                className={`
                  mt-3 text-xs font-medium
                  ${isToday
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-white/50"}
                `}
              >
                {DAYS[i]}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Footer */}
      <div className="flex justify-between text-xs text-neutral-600 dark:text-white/60">
        <span>
          Today:{" "}
          <span className="font-semibold text-neutral-900 dark:text-white">
            {DAYS[currentDay]}
          </span>
        </span>
        <span>
          Daily Avg:{" "}
          <span className="font-semibold text-neutral-900 dark:text-white">
            {avgDailyHours.toFixed(1)}h
          </span>
        </span>
      </div>
    </div>
  );
}
