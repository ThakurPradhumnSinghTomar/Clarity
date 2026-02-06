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
    <div className="bg-[var(--color-surface-elevated)] rounded-2xl shadow-lg border border-[var(--color-border)] overflow-hidden">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-sky)]" />

      <div className="px-6 pb-6">
        {/* Avatar + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-[var(--color-surface-elevated)] bg-[var(--color-surface-muted)] overflow-hidden shadow-lg">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-[var(--color-text-subtle)]" />
                </div>
              )}
            </div>

            {isEditing && (
              <label
                className={`absolute bottom-0 right-0 w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--color-primary-strong)] transition-colors shadow-lg ${
                  uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-white" />
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
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-strong)] transition-colors font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={onCancel}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-muted)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors font-medium disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-strong)] transition-colors font-medium disabled:opacity-50"
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
