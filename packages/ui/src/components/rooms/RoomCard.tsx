import React from "react";
import { useTheme } from "@repo/context-providers";
import { Divide } from "lucide-react";

interface RoomCardProps {
  id: string;
  name: string;
  memberCount: number;
  focusingCount: number;
  rank?: number;
  lastActive?: string;
  color?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  name,
  memberCount,
  focusingCount,
  rank,
  lastActive,
  color = "#7C9AFF",
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <div
      className="group rounded-2xl p-5 border backdrop-blur-xl transition-all duration-300 cursor-pointer"
      style={{
        background: isDark ? "rgba(21,27,34,0.65)" : "rgba(242,245,240,0.75)",
        borderColor: isDark
          ? "rgba(129,149,149,0.45)"
          : "rgba(202,207,201,0.6)",
      }}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm"
            style={{
              background: isDark
                ? "rgba(125,211,252,0.15)"
                : "rgba(59,130,246,0.12)",
              color: isDark ? "#E5E7EB" : "#0F172A",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3
              className="font-semibold tracking-tight"
              style={{ color: isDark ? "#E5E7EB" : "#0F172A" }}
            >
              {name}
            </h3>

            {lastActive && (
              <p
                className="text-xs mt-0.5"
                style={{ color: isDark ? "#819595" : "#626b61" }}
              >
                Active {lastActive}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="flex items-center justify-between text-xs">
        <div style={{ color: isDark ? "#819595" : "#626b61" }}>
          {memberCount+1} {memberCount === 1 ? "member" : "members"}
        </div>

        {focusingCount > 0 ? (
          <div style={{ color: isDark ? "#819595" : "#626b61" }}>
            {focusingCount} is focusing now..🔥
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* SUBTLE HOVER ACCENT */}
      <div
        className="mt-4 h-[2px] rounded-full transition-all duration-300"
        style={{
          background: color,
          opacity: 0.25,
        }}
      />
    </div>
  );
};
