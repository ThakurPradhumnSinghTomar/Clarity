"use client";

import { User, Mail, Calendar, Check } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  image: string | null;
  provider: "google" | "github" | "credentials" | "loading...";
  emailVerified: string;
  joinedDate: string;
}

interface ProfileInfoSectionProps {
  isEditing: boolean;
  profileData: ProfileData;
  editData: ProfileData;
  setEditData: (data: ProfileData) => void;
}

export function ProfileInfoSection({
  isEditing,
  profileData,
  editData,
  setEditData,
}: ProfileInfoSectionProps) {
  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getProviderBadgeColor = (provider: string): string => {
    const colors: Record<string, string> = {
      google: "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400",
      github:
        "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400",
      credentials:
        "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400",
    };
    return colors[provider] || colors.credentials ||"bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400" ;
  };

  return (
    <div className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
          Full Name
        </label>

        {isEditing ? (
          <input
            type="text"
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
            className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
            <User className="w-5 h-5 text-[var(--color-text-subtle)]" />
            <span className="text-[var(--color-text)]">
              {profileData.name}
            </span>
          </div>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
          Email Address
        </label>

        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
          <Mail className="w-5 h-5 text-[var(--color-text-subtle)]" />
          <span className="flex-1 text-[var(--color-text)]">
            {profileData.email}
          </span>

          {profileData.emailVerified && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 rounded-full font-medium">
              <Check className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--color-text-subtle)] mt-1">
          Email cannot be changed
        </p>
      </div>

      {/* Provider + Joined */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Sign-in Method
          </label>
          <div className="px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getProviderBadgeColor(
                profileData.provider,
              )}`}
            >
              {profileData.provider}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Member Since
          </label>
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
            <Calendar className="w-5 h-5 text-[var(--color-text-subtle)]" />
            <span className="text-[var(--color-text)]">
              {formatDate(profileData.joinedDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
