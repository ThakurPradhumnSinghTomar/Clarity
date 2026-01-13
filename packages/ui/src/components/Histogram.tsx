"use client";
import React, { useState, useMemo } from "react";
import { useTheme } from "@repo/context-providers";
import { motion, AnimatePresence } from "framer-motion";

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

/* ===== Motion ===== */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const barVariants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: EASE },
  },
};

/* ===== Utils ===== */

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay() || 7; // Sun = 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { day: "numeric", month: "short" });

  return `${fmt(monday)} – ${fmt(sunday)}`;
};

const realTodayIndex = (() => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1; // Mon=0 ... Sun=6
})();

export default function Histogram({
  data,
  currentDay,
  isCurrentWeek,
}: HistogramProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const max = useMemo(() => Math.max(...data, 10), [data]);
  const totalWeekHours = useMemo(() => data.reduce((s, h) => s + h, 0), [data]);
  const avgDailyHours = useMemo(() => totalWeekHours / 7, [totalWeekHours]);

  const getBarHeight = (value: number) => {
    if (value <= 0) return 0;

    const ratio = value / max; // true proportional scale

    // soft visual floor so tiny values are visible but honest
    const minHeight = 3; // %
    const scaled = ratio * 100;

    return Math.max(scaled, minHeight);
  };

  return (
    <div
      className="w-full min-h-[360px] rounded-2xl border backdrop-blur-xl shadow-sm p-8"
      style={{
        background: isDark ? "rgba(21,27,34,0.55)" : "rgba(242,245,240,0.75)",
        borderColor: isDark
          ? "rgba(129,149,149,0.45)"
          : "rgba(202,207,201,0.6)",
      }}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3
            className="text-xl font-semibold tracking-tight"
            style={{ color: isDark ? "#E5E7EB" : "#0F172A" }}
          >
            Weekly Study Hours
          </h3>

          <p
            className="text-sm mt-1"
            style={{ color: isDark ? "#819595" : "#626b61" }}
          >
            {getWeekRange()} · Mon → Sun
          </p>
        </div>

        <div
          className="px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: isDark
              ? "rgba(125,211,252,0.12)"
              : "rgba(59,130,246,0.08)",
            color: isDark ? "#CBD5E1" : "#334155",
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
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(selected === i ? null : i)}
                className="w-full h-full flex items-end justify-center cursor-pointer"
              >
                <motion.div
                  variants={barVariants}
                  className="w-full rounded-t-xl"
                  style={{
                    height: `${heightPct}%`,
                    transformOrigin: "bottom",
                    background: isToday
                      ? isDark
                        ? "#E5E7EB"
                        : "#0F172A"
                      : isDark
                        ? "#819595"
                        : "#7a8679",
                    boxShadow: isActive
                      ? "0 8px 20px rgba(0,0,0,0.18)"
                      : "none",
                  }}
                />
              </div>

              {/* DAY */}
              <div
                className="mt-3 text-xs font-medium"
                style={{
                  color: isToday
                    ? isDark
                      ? "#E5E7EB"
                      : "#0F172A"
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute -top-2 px-3 py-1.5 text-xs rounded-lg shadow-lg whitespace-nowrap -translate-x-1/2 left-1/2"
                    style={{
                      background: isDark ? "#151B22" : "#ffffff",
                      color: isDark ? "#E5E7EB" : "#0F172A",
                      border: `1px solid ${
                        isDark ? "rgba(129,149,149,0.45)" : "#e2e8f0"
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
            ? "rgba(129,149,149,0.45)"
            : "rgba(202,207,201,0.6)",
        }}
      >
        <div
          className="text-xs"
          style={{ color: isDark ? "#819595" : "#626b61" }}
        >
          {isCurrentWeek ? (
            <>
              Today:{" "}
              <span
                className="font-semibold"
                style={{ color: isDark ? "#E5E7EB" : "#0F172A" }}
              >
                {DAYS[realTodayIndex]}
              </span>
            </>
          ) : (
            <>
              Viewing week:{" "}
              <span
                className="font-semibold"
                style={{ color: isDark ? "#E5E7EB" : "#0F172A" }}
              >
                Mon – Sun
              </span>
            </>
          )}
        </div>

        <div
          className="text-xs"
          style={{ color: isDark ? "#819595" : "#626b61" }}
        >
          Daily Avg:{" "}
          <span
            className="font-semibold"
            style={{ color: isDark ? "#E5E7EB" : "#0F172A" }}
          >
            {avgDailyHours.toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
}
