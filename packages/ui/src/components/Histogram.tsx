import React, { useState, useMemo } from "react";
import { histogramProps } from "@repo/types";

// Days of the week for x-axis labels
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper function to format hours with proper plural/singular
function formatHours(h: number) {
  return `${h} hr${h !== 1 ? "s" : ""}`;
}

export default function Histogram({data,currentDay} : histogramProps ) {
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
    <div className="p-6 rounded-2xl w-full max-w-4xl bg-white dark:bg-[#0b1220] text-slate-900 dark:text-gray-200">
      
      {/* Header section with title and subtitle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-semibold">Weekly Study Hours</h3>
          <p className="text-sm opacity-70 dark:opacity-60">
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
                    // Highlight current day with yellow ring
                    (isToday
                      ? "ring-2 ring-offset-2 ring-blue-950 dark:ring-blue-950 dark:ring-offset-[#0b1220] "
                      : "") +
                    // Scale and add shadow on hover/select
                    (isActive ? " scale-105 shadow-lg " : " shadow ") +
                    // Blue gradient for light mode, gray for dark mode
                    "bg-linear-to-t from-sky-500 to-sky-400 dark:from-slate-600 dark:to-slate-500"
                  }
                />
              </div>
              
              {/* Day label below the bar */}
              <div className="mt-3 text-xs font-medium opacity-70 dark:opacity-60">
                {DAYS[i]}
              </div>

              {/* Tooltip showing hours count (only visible on hover/select) */}
              {(hovered === i || selected === i) && (
                <div className="absolute -top--5 px-2 py-1 text-xs rounded-md shadow-md whitespace-nowrap transform -translate-x-1/2 left-1/2 bg-white text-slate-900 border dark:bg-[#0b1724] dark:text-gray-100">
                  {formatHours(h)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer section showing current day indicator */}
      <div className="mt-6 text-sm opacity-80 flex justify-between items-center">
        <div className="text-xs opacity-60">
          Today: <span className="font-semibold">{DAYS[currentDay]}</span>
        </div>
      </div>
    </div>
  );
}