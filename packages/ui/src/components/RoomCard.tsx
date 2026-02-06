"use client"

import React from "react"
import { Users, Clock, Trophy } from "lucide-react"
import { motion } from "framer-motion"

interface RoomCardProps {
  id: string
  name: string
  memberCount: number
  totalStudyTime: number
  rank?: number
  lastActive?: string
}

export const RoomCard: React.FC<RoomCardProps> = ({
  name,
  memberCount,
  focusingCount,
  rank,
  lastActive,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const formatStudyTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="
        cursor-pointer
        rounded-2xl
        px-6 py-5
        border border-neutral-200/60 dark:border-neutral-700/50
        bg-white/70 dark:bg-neutral-900/60
        backdrop-blur
        shadow-sm hover:shadow-md
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          {/* Neutral avatar */}
          <div
            className="
              w-10 h-10 rounded-xl
              flex items-center justify-center
              bg-neutral-200/70 dark:bg-neutral-700/60
              text-neutral-700 dark:text-neutral-200
              font-medium
            "
          >
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-medium text-neutral-900 dark:text-white truncate">
              {name}
            </h3>

            {lastActive && (
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                Active {lastActive}
              </p>
            )}
          </div>
        </div>

        
      </div>

      {/* Spacer instead of hard divider */}
      <div className="h-6" />

      {/* Meta */}
      <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
        <div className="flex items-center gap-2">
          <Users size={15} />
          <span>
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={15} />
          <span>{formatStudyTime(totalStudyTime)}</span>
        </div>

        {focusingCount > 0 ? (
          <div style={{ color: isDark ? "#819595" : "#626b61" }}>
            {focusingCount} is focusing now..🔥
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </motion.div>
  )
}
