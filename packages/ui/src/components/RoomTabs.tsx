"use client"

import { motion } from "framer-motion"

type RoomTabsProps = {
  roomSelection: string
  setRoomSelection: React.Dispatch<React.SetStateAction<string>>
  tabs: string[]
}

export default function RoomTabs({
  roomSelection,
  setRoomSelection,
  tabs,
}: RoomTabsProps) {
  return (
    <div className="flex justify-center mt-6">
      <div className="relative flex gap-2 p-2 rounded-3xl dark:bg-[#1c1d1f]">
        {tabs.map((tab) => {
          const isActive = roomSelection === tab

          return (
            <div
              key={tab}
              onClick={() => setRoomSelection(tab)}
              className="
                relative cursor-pointer
                px-6 py-2
                font-semibold
                dark:text-white
                select-none
              "
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-2xl dark:bg-[#252628]"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                />
              )}

              <span className="relative z-10">{tab}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/*
How the sliding pill animation works (Framer Motion)

Framer Motion uses layoutId to treat elements with the same ID across renders as the same element, not new ones.
When state changes, the element with a given layoutId disappears from one place and appears in another. Framer Motion captures the previous and next bounding boxes (position + size) and automatically animates between them.

This creates a smooth sliding effect without manually animating x/y values.

Key points:

Only one element with a given layoutId exists at a time

Framer Motion interpolates layout changes automatically

Animations are responsive and layout-aware

No hard-coded positions or calculations needed

This technique is commonly used for segmented controls, sliding indicators, and shared UI elements.

*/