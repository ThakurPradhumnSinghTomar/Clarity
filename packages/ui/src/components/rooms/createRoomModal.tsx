"use client"
import React, { useState } from "react";
import { X, Lock, Globe, Key, Loader2 } from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomName: string, isPrivate: boolean, roomDiscription : string) => void;
  isLoading?: boolean; // Add this
  
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [roomDiscription, setRoomDiscription] = useState("");

  const handleSubmit = () => {
    if (roomName.trim()) {
      onSubmit(roomName.trim(), isPrivate, roomDiscription);
      setRoomName("");
      setIsPrivate(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Room
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Room Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Room description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Description
            </label>
            <input
              type="text"
              value={roomDiscription}
              onChange={(e) => setRoomDiscription(e.target.value)}
              placeholder="Enter room name..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Privacy Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Room Privacy
            </label>
            <div className="space-y-3">
              {/* Public Option */}
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                  !isPrivate
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    !isPrivate
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Globe size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Public Room
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Anyone can discover and join this room
                  </p>
                </div>
              </button>

              {/* Private Option */}
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                  isPrivate
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isPrivate
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Lock size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Private Room
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Only members with an invite code can join
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!roomName.trim()}
          >
                {isLoading ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          Creating...
        </>
      ) : (
        'Create Room'
      )}
          </button>
        </div>
      </div>
    </div>
  );
};
