"use client";

import { Camera, User, Edit2, X, Save } from "lucide-react";

type ProfileHeaderProps = {
  isEditing: boolean;
  uploadingImage: boolean;
  image: string | null;
  imagePreview: string | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ProfileHeader({
  isEditing,
  uploadingImage,
  image,
  imagePreview,
  onEdit,
  onCancel,
  onSave,
  onImageChange,
}: ProfileHeaderProps) {
  const avatarSrc = imagePreview || image || null;

  return (
    <div className="bg-gray-50 dark:bg-[#171E26] rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-[#1F2C3B] dark:to-[#0F1419]" />

      <div className="px-6 pb-6">
        {/* Avatar + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-gray-50 dark:border-zinc-900 bg-gray-200 dark:bg-zinc-800 overflow-hidden shadow-lg">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {isEditing && (
              <label
                className={`absolute bottom-0 right-0 w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg ${
                  uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-white dark:text-black" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            )}

            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 sm:mt-0 flex gap-2">
            {!isEditing ? (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={onCancel}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors font-medium disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {uploadingImage ? "Uploading..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
