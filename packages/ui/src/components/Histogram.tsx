import React, { useState, useMemo } from "react";
import { histogramProps } from "@repo/types";

// Days of the week for x-axis labels
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper function to format hours with proper plural/singular
const formatStudyTime = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0 && m > 0) return `${h} hour ${m} minutes studied`;
  if (h > 0) return `${h} hours studied`;
  return `${m} minutes studied`;
};

export default function Histogram({data, currentDay}: histogramProps) {
  // State for hover interactions
  const [hovered, setHovered] = useState<number | null>(null);
  // State for click/select interactions
  const [selected, setSelected] = useState<number | null>(null);
  // Calculate maximum value from data for scaling bars
  const max = useMemo(() => Math.max(...data, 10), [data]);
  
  // Calculate bar height with intelligent scaling for visibility
  const getBarHeight = (value: number) => {
    if (value === 0) return 0; 
    const percentage = (value / (max+2)) * 100; // Calculate proportional height
    
    return Math.max(percentage, 8);
  };

  return (
    // Main container with rounded corners and dark mode support
    <div className="p-6 rounded-2xl w-full max-w-4xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-800 shadow-lg min-h-[432px]">
      
      {/* Header section with title and subtitle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-semibold">Weekly Study Hours</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your Weekly study hours easily
          </p>
        </div>
      </div>

      {/* Chart container - 256px height with bottom alignment for bars */}
      <div className="w-full h-64 flex items-end gap-4 pb-8">
        {data.map((h, i) => {
          // Calculate height percentage for this bar
          const heightPct = getBarHeight(h);
          // Check if this is the current day
          const isToday = i === currentDay-1;
          // Check if this bar is being interacted with
          const isActive = hovered === i || selected === i;

          return (
            // Outer container for each day column (takes full height)
            <div
              key={i}
              className="relative flex-1 flex flex-col items-center justify-end transition-all duration-200 h-full"
            >
              {/* Interactive button wrapper for the bar */}
              <div
                role="button"
                aria-label={`${DAYS[i]}: ${h} hours`}
                onMouseEnter={() => setHovered(i)} // Show tooltip on hover
                onMouseLeave={() => setHovered(null)} // Hide tooltip on leave
                onClick={() => setSelected(selected === i ? null : i)} // Toggle selection
                className="w-full h-full flex flex-col items-center justify-end cursor-pointer select-none"
              >
                {/* The actual bar with dynamic height and styling */}
                <div
                  style={{ height: `${heightPct}%` }} // Dynamic height based on value
                  className={
                    "w-full rounded-t-md transition-all duration-150 " +
                    // Highlight current day with ring
                    (isToday
                      ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-white ring-offset-gray-50 dark:ring-offset-zinc-900 "
                      : "") +
                    // Scale and add shadow on hover/select
                    (isActive ? " scale-105 shadow-lg " : " shadow ") +
                    // Gradient for bars
                    "bg-gradient-to-t from-gray-800 to-gray-700 dark:from-gray-100 dark:to-white"
                  }
                />
              </div>
              
              {/* Day label below the bar */}
              <div className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                {DAYS[i]}
              </div>

              {/* Tooltip showing hours count (only visible on hover/select) */}
              {(hovered === i || selected === i) && (
                <div className="absolute -top-8 px-2 py-1 text-xs rounded-md shadow-md whitespace-nowrap transform -translate-x-1/2 left-1/2 bg-white text-gray-900 border border-gray-200 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 font-medium">
                  {formatStudyTime(h)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer section showing current day indicator */}
      <div className="mt-6 text-sm flex justify-between items-center">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Today: <span className="font-semibold text-gray-900 dark:text-white">{DAYS[currentDay-1]}</span>
        </div>
      </div>
    </div>
  );
}