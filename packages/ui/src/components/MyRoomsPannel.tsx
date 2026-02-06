"use client"

import React from "react"
import { Users } from "lucide-react"
import { Room } from "@repo/types"
import { RoomCard } from "@repo/ui"

type MyRoomsPanelProps = {
  myRooms: Room[]
  isLoadingRooms: boolean
  error: string | null

  onRetry: () => void
  onCreateRoom: () => void
  onJoinRoom: () => void
  onOpenRoom: (roomId: string) => void

  transformRoomData: (room: Room) => any
  RoomCardSkeleton: React.FC
}

export const MyRoomsPanel: React.FC<MyRoomsPanelProps> = ({
  myRooms,
  isLoadingRooms,
  error,
  onRetry,
  onCreateRoom,
  onJoinRoom,
  onOpenRoom,
  transformRoomData,
  RoomCardSkeleton,
}) => {
  return (
    <div>
      {/* Loading */}
      {isLoadingRooms && (
        <div className="flex-col gap-2">
          <RoomCardSkeleton />
          <RoomCardSkeleton />
          <RoomCardSkeleton />
        </div>
      )}

      {/* Error */}
      {error && !isLoadingRooms && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoadingRooms && !error && myRooms.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Users
            size={48}
            className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
          />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Rooms Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create a new room or join an existing one to get started
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onCreateRoom}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Create Room
            </button>
            <button
              onClick={onJoinRoom}
              className="px-6 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      {!isLoadingRooms && !error && myRooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {myRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onOpenRoom(room.id)}
            >
              <RoomCard {...transformRoomData(room)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
