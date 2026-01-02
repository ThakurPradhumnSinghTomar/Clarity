"use client";
import React, { useState, useMemo } from "react";
import { useTheme } from "@repo/context-providers";
import { motion, AnimatePresence } from "framer-motion";


interface HistogramProps {
  data: number[];
  currentDay: number;
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

/* ===== Framer Motion Variants ===== */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];



const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const barVariants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: {
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASE,
    },
  },
};


export default function Histogram({ data, currentDay }: HistogramProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const { mode } = useTheme();
  const isDark = mode === "dark";

  const max = useMemo(() => Math.max(...data, 10), [data]);
  const totalWeekHours = useMemo(
    () => data.reduce((sum, h) => sum + h, 0),
    [data]
  );
  const avgDailyHours = useMemo(
    () => totalWeekHours / 7,
    [totalWeekHours]
  );

  const getBarHeight = (value: number) => {
    if (value === 0) return 0;
    const percentage = (value / (max + 2)) * 100;
    return Math.max(percentage, 8);
  };

  return (
    <div
      className="w-full max-w-4xl min-h-[360px] rounded-2xl border backdrop-blur-xl shadow-sm p-8"
      style={{
        backgroundColor: isDark
          ? "rgba(54, 57, 70, 0.55)" // Gunmetal
          : "rgba(242, 245, 240, 0.7)", // soft-linen
        borderColor: isDark
          ? "rgba(129, 149, 149, 0.45)" // Cool Steel
          : "rgba(202, 207, 201, 0.6)",
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-xl font-semibold tracking-tight"
            style={{ color: isDark ? "#B1B6A6" : "#313630" }}
          >
            Weekly Study Hours
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: isDark ? "#819595" : "#626b61" }}
          >
            Track your weekly study progress
          </p>
        </div>

        <div
          className="px-4 py-2 rounded-full text-sm font-medium"
          style={{
            backgroundColor: isDark
              ? "rgba(105, 103, 115, 0.55)" // Dim Grey
              : "rgba(229, 234, 225, 0.8)",
            color: isDark ? "#B1B6A6" : "#495049",
          }}
        >
          {totalWeekHours.toFixed(1)}h total
        </div>
      </div>

      {/* CHART */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full h-64 flex items-end gap-3 pb-8"
      >
        {data.map((h, i) => {
          const heightPct = getBarHeight(h);
          const isToday = i === currentDay;
          const isActive = hovered === i || selected === i;

          return (
            <div
              key={i}
              className="relative flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                role="button"
                aria-label={`${DAYS[i]}: ${h} hours`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(selected === i ? null : i)}
                className="w-full h-full flex items-end justify-center cursor-pointer select-none"
              >
                <motion.div
                  variants={barVariants}
                  style={{
                    height: `${heightPct}%`,
                    transformOrigin: "bottom",
                    backgroundColor: isDark
                      ? isToday
                        ? "#B1B6A6" // Ash Grey (today)
                        : "#819595" // Cool Steel
                      : "#7a8679", // ebony
                    boxShadow: isActive
                      ? "0 6px 18px rgba(0,0,0,0.15)"
                      : "none",
                  }}
                  className="w-full rounded-t-xl"
                />
              </div>

              {/* DAY LABEL */}
              <div
                className="mt-3 text-xs font-medium"
                style={{
                  color: isToday
                    ? isDark
                      ? "#B1B6A6"
                      : "#313630"
                    : isDark
                    ? "#696773"
                    : "#7a8679",
                }}
              >
                {DAYS[i]}
              </div>

              {/* TOOLTIP */}
              <AnimatePresence>
                {(hovered === i || selected === i) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                    className="absolute -top-2 px-3 py-1.5 text-xs rounded-lg shadow-lg whitespace-nowrap -translate-x-1/2 left-1/2"
                    style={{
                      backgroundColor: isDark
                        ? "#363946"
                        : "#f2f3f2",
                      color: isDark ? "#B1B6A6" : "#313630",
                      border: `1px solid ${
                        isDark ? "#819595" : "#cacfc9"
                      }`,
                    }}
                  >
                    {formatStudyTime(h)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>

      {/* FOOTER */}
      <div
        className="mt-6 pt-4 flex justify-between items-center border-t"
        style={{
          borderColor: isDark
            ? "rgba(129, 149, 149, 0.45)"
            : "rgba(202, 207, 201, 0.6)",
        }}
      >
        <div
          className="text-xs"
          style={{ color: isDark ? "#819595" : "#626b61" }}
        >
          Today:{" "}
          <span
            className="font-semibold"
            style={{ color: isDark ? "#B1B6A6" : "#313630" }}
          >
            {DAYS[currentDay]}
          </span>
        </div>

        <div
          className="text-xs"
          style={{ color: isDark ? "#819595" : "#626b61" }}
        >
          Daily Avg:{" "}
          <span
            className="font-semibold"
            style={{ color: isDark ? "#B1B6A6" : "#313630" }}
          >
            {avgDailyHours.toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
}
