"use client";

import { motion } from "framer-motion";
import { RoomCard } from "@repo/ui";

export type RoomsSectionProps = {
  isLoading: boolean;
  rooms: any[];
  onRoomClick: (roomId: string) => void;
};

export function RoomsSection({
  isLoading,
  rooms,
  onRoomClick,
}: RoomsSectionProps) {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Your Rooms</h2>
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
          Accountability works better with people.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="opacity-60">Loading rooms…</p>
        ) : rooms.length ? (
          rooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ y: -6 }}
              className="
                cursor-pointer transition
                hover:shadow-lg
                dark:hover:shadow-[0_20px_40px_rgba(124,154,255,0.15)]
              "
              onClick={() => onRoomClick(room.id)}
            >
              <RoomCard {...room} />
            </motion.div>
          ))
        ) : (
          <p className="opacity-60">No rooms joined yet</p>
        )}
      </div>
    </section>
  );
}
