"use client";

import { Settings, Delete, LogOut } from "lucide-react";

type RoomHeaderProps = {
  name: string;
  description: string;
  isHost: boolean;
  onEdit: () => void;
  onDeleteOrLeave: () => void;
};

export function RoomHeader({
  name,
  description,
  isHost,
  onEdit,
  onDeleteOrLeave,
}: RoomHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {description}
          </p>
        </div>

        <div className="flex gap-3">
          {isHost && (
            <button
              onClick={onEdit}
              className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
            >
              <Settings size={20} />
            </button>
          )}

          <button
            onClick={onDeleteOrLeave}
            className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            {isHost ? <Delete size={20} /> : <LogOut size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
