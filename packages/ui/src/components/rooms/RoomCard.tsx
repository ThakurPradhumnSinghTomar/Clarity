import React from "react";

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
        background:
          "color-mix(in srgb, var(--color-surface) 78%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--color-border) 70%, transparent)",
      }}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm"
            style={{
              background:
                "color-mix(in srgb, var(--color-accent-sky) 15%, transparent)",
              color: "var(--color-text)",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3
              className="font-semibold tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              {name}
            </h3>

            {lastActive && (
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Active {lastActive}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="flex items-center justify-between text-xs">
        <div style={{ color: "var(--color-text-muted)" }}>
          {memberCount+1} {memberCount === 1 ? "member" : "members"}
        </div>

        {focusingCount > 0 ? (
          <div style={{ color: "var(--color-text-muted)" }}>
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
