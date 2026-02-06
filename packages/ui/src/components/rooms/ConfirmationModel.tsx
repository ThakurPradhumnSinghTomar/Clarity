"use client";

import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  isDestructive?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isDestructive = false,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  isDestructive
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                }`}
              >
                <AlertTriangle
                  className={
                    isDestructive
                      ? "text-red-600 dark:text-red-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }
                  size={24}
                />
              </div>

              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    isDestructive
                      ? "bg-red-600 text-white"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
