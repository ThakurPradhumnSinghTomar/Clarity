"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Key } from "lucide-react"

interface JoinRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (inviteCode: string) => void
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [inviteCode, setInviteCode] = useState("")

  const handleSubmit = () => {
    if (!inviteCode.trim()) return
    onSubmit(inviteCode.trim())
    setInviteCode("")
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="
        w-full max-w-xl mx-auto
        rounded-2xl
        border border-neutral-200 dark:border-neutral-700
        bg-neutral-50 dark:bg-[#272A34]
      "
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Join a Room
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Info card */}
        <div className="
          flex gap-4 p-4 rounded-xl
          border border-neutral-200 dark:border-neutral-700
          bg-white dark:bg-neutral-800
        ">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Key size={18} />
          </div>
          <div>
            <div className="font-medium text-neutral-900 dark:text-white">
              Invite Code Required
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Ask the room creator or a member to share the invite code.
            </div>
          </div>
        </div>

        {/* Invite Code Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Invite Code
          </label>
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="
              w-full px-4 py-3 rounded-xl
              bg-white dark:bg-neutral-800
              border border-neutral-300 dark:border-neutral-600
              text-neutral-900 dark:text-white
              font-mono tracking-widest
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Codes are usually 6–8 characters
          </p>
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
          disabled={!inviteCode.trim()}
          className="
            px-6 py-2 rounded-xl
            bg-indigo-600 text-white
            hover:bg-indigo-700
            disabled:opacity-50
          "
        >
          Join Room
        </button>
      </div>
    </motion.div>
  )
}
