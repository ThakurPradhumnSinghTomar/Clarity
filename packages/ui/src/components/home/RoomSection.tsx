"use client";

import { motion } from "framer-motion";
import { RoomCard } from "@repo/ui";

export type RoomsSectionProps = {
  isLoading: boolean;
  rooms: any[];
  onRoomClick: (roomId: string) => void;
};

/* ---------------- Loading Skeleton ---------------- */
const RoomCardSkeleton = () => (
  <div className="bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a] p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 dark:bg-[#2a2d3a] rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-[#2a2d3a] rounded w-1/2" />
      </div>
      <div className="w-10 h-10 bg-gray-200 dark:bg-[#2a2d3a] rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-[#2a2d3a] rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-[#2a2d3a] rounded w-5/6" />
    </div>
  </div>
);

/* ---------------- Empty State ---------------- */
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full"
  >
    <div className="bg-white dark:bg-[#1a1d29] rounded-lg border-2 border-dashed border-gray-300 dark:border-[#2a2d3a] p-12 text-center">
      <div className="max-w-md mx-auto space-y-4">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-[#252836] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Rooms Yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Join or create a study room to collaborate with others and stay accountable together.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Room or Join Room
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ---------------- Main Component ---------------- */
export function RoomsSection({
  isLoading,
  rooms,
  onRoomClick,
}: RoomsSectionProps) {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a] p-4 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Your Study Rooms
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Accountability works better with people
              </p>
            </div>
          </div>

          {/* Room Count Badge */}
          {!isLoading && rooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800/30">
                <span className="text-sm font-semibold">
                  {rooms.length} {rooms.length === 1 ? "Room" : "Rooms"}
                </span>
              </div>
              <button className="p-2 bg-white dark:bg-[#252836] border border-gray-300 dark:border-[#2a2d3a] rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2d3a] transition-all duration-200">
                <svg
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {isLoading ? (
          // Loading Skeletons
          <>
            {[1, 2, 3].map((i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </>
        ) : rooms.length > 0 ? (
          // Room Cards
          rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onRoomClick(room.id)}
            >
              <div className="h-full bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a] hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 overflow-hidden group">
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 dark:group-hover:from-blue-900/10 dark:group-hover:to-indigo-900/10 transition-all duration-200 pointer-events-none" />
                
                {/* Card Content */}
                <div className="relative p-5">
                  <RoomCard {...room} />
                </div>

                {/* Bottom Action Bar */}
                <div className="relative border-t border-gray-200 dark:border-[#2a2d3a] bg-gray-50 dark:bg-[#252836] px-5 py-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Click to view details
                  </span>
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          // Empty State
          <EmptyState />
        )}
      </div>

      {/* Quick Actions Footer (only shown when rooms exist) */}
      {!isLoading && rooms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className=" bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30 p-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Want to boost your productivity?
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Create a new room or invite friends to join your sessions
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                Create Room
              </button>
              <button className="px-4 py-2 bg-white dark:bg-[#252836] border border-gray-300 dark:border-[#2a2d3a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2d3a] text-sm font-medium rounded-lg transition-all duration-200">
                Invite Friends
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Tip */}
      {!isLoading && rooms.length > 0 && (
        <div className="bg-white dark:bg-[#1a1d29] rounded-lg border border-gray-200 dark:border-[#2a2d3a] p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center  mt-0.5">
              <svg
                className="w-3 h-3 text-blue-600 dark:text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-semibold">Pro Tip:</span> Study rooms help you stay focused and motivated. Join active rooms to see real-time progress from other members!
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}