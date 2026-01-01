"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Lock, Globe, Loader2 } from "lucide-react"

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    roomName: string,
    isPrivate: boolean,
    roomDiscription: string
  ) => void
  isLoading?: boolean
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [roomName, setRoomName] = useState("")
  const [isPrivate, setIsPrivate] = useState(true)
  const [roomDiscription, setRoomDiscription] = useState("")

  const handleSubmit = () => {
    if (!roomName.trim()) return
    onSubmit(roomName.trim(), isPrivate, roomDiscription)
    setRoomName("")
    setRoomDiscription("")
    setIsPrivate(true)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="
        w-full mx-auto max-w-xl
        rounded-2xl
        border border-neutral-200 dark:border-neutral-700
        bg-neutral-50 dark:bg-[#272A34]
      "
    >
     

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Room Name */}
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Room Name
          </label>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            className="
              w-full px-4 py-3 rounded-xl
              bg-white dark:bg-neutral-800
              border border-neutral-300 dark:border-neutral-600
              text-neutral-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />
        </div>

        {/* Room Description */}
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Room Description
          </label>
          <input
            value={roomDiscription}
            onChange={(e) => setRoomDiscription(e.target.value)}
            placeholder="Optional description"
            className="
              w-full px-4 py-3 rounded-xl
              bg-white dark:bg-neutral-800
              border border-neutral-300 dark:border-neutral-600
              text-neutral-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />
        </div>

        {/* Privacy */}
        <div className="space-y-3">
          <PrivacyOption
            active={!isPrivate}
            title="Public Room"
            desc="Anyone can discover and join"
            icon={<Globe size={18} />}
            onClick={() => setIsPrivate(false)}
          />

          <PrivacyOption
            active={isPrivate}
            title="Private Room"
            desc="Invite code required"
            icon={<Lock size={18} />}
            onClick={() => setIsPrivate(true)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 flex justify-end gap-3 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onClose}
          className="
            px-5 py-2 rounded-xl
            text-neutral-700 dark:text-neutral-300
            hover:bg-neutral-200 dark:hover:bg-neutral-700
            transition
          "
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={!roomName.trim() || isLoading}
          className="
            px-6 py-2 rounded-xl
            bg-indigo-600 text-white
            hover:bg-indigo-700
            disabled:opacity-50
            flex items-center gap-2
          "
        >
          {isLoading && <Loader2 size={18} className="animate-spin" />}
          Create Room
        </button>
      </div>
    </motion.div>
  )
}

/* ---- helper ---- */

function PrivacyOption({
  active,
  title,
  desc,
  icon,
  onClick,
}: {
  active: boolean
  title: string
  desc: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        w-full flex gap-4 p-4 rounded-xl border
        transition
        ${
          active
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-neutral-300 dark:border-neutral-600"
        }
      `}
    >
      <div
        className={`
          w-9 h-9 rounded-lg flex items-center justify-center
          ${
            active
              ? "bg-indigo-600 text-white"
              : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
          }
        `}
      >
        {icon}
      </div>
      <div className="text-left">
        <div className="font-medium text-neutral-900 dark:text-white">
          {title}
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {desc}
        </div>
      </div>
    </button>
  )
}
