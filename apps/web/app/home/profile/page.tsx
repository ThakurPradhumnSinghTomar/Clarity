"use client";
import React, { useEffect, useState } from "react";
import {
  Camera,
  Mail,
  User,
  Calendar,
  Check,
  X,
  Edit2,
  Save,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const FALLBACK_IMAGE = process.env.NEXT_PUBLIC_FALLBACK_IMAGE as string; // Your fallback image path

interface ProfileData {
  name: string;
  email: string;
  image: string | null;
  provider: "google" | "github" | "credentials" | "loading...";
  emailVerified: string;
  joinedDate: string;
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "loading..",
    email: "loading..",
    image: null,
    provider: "credentials",
    emailVerified: "loading...",
    joinedDate: "loading...",
  });

  const [editData, setEditData] = useState<ProfileData>({ ...profileData });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [totalStudyHours, setTotalStudyHours] = useState(0);
  const [totalFocusSessions, setTotalFocusSessions] = useState(0);

  const { data: session, update } = useSession();
  const token = session?.accessToken;

  useEffect(() => {
    getProfileData();
  }, []);

  const handleEdit = () => {
    setEditData({ ...profileData }); // Sync editData with current profileData
    setIsEditing(true);
  };

  const formatStudyTime = (seconds: number) => {
    const totalMinutes = Math.round(seconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h > 0 && m > 0) return `${h} hour ${m} minutes studied`;
    if (h > 0) return `${h} hours studied`;
    return `${m} minutes studied`;
  };

  const getProfileData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-current-user-profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.log(
          "response is not okay from backend to get current user profile"
        );
        return;
      }

      const data = await response.json();
      const formData = {
        name: data.response.name,
        email: data.response.email,
        image: data.response.image,
        provider: data.response.provider,
        emailVerified: data.response.emailVerified,
        joinedDate: data.response.createdAt,
      };

      setProfileData(formData);
      setTotalFocusSessions(data.response.focusSessions.length);

      const totalStudyHours = () => {
        let studyHrs = 0;
        data.response.focusSessions.map((focusSession: any) => {
          studyHrs = studyHrs + focusSession.durationSec;
        });
        setTotalStudyHours(studyHrs);
      };

      totalStudyHours();
    } catch (error) {
      console.log("failed to get form data", error);
    }
  };

  // ============================================
  // CLOUDINARY UPLOAD FUNCTION
  // ============================================
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET!);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary error:", errorData);
        throw new Error(
          `Upload failed: ${errorData.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      console.log("profile image link is:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  // ============================================
  // IMAGE UPLOAD HANDLER
  // ============================================
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);
      console.log("cloudinary url is:", cloudinaryUrl);

      // Update editData with the Cloudinary URL
      setEditData({ ...editData, image: cloudinaryUrl });
      setImagePreview(cloudinaryUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // ============================================
  // REMOVE IMAGE HANDLER
  // ============================================
  const removeImage = () => {
    setImagePreview(null);
    setEditData({ ...editData, image: FALLBACK_IMAGE });
  };

  // ============================================
  // SAVE HANDLER
  // ============================================
  const handleSave = async () => {
    try {
      // 1. Save to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update-profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editData.name,
            image: editData.image,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // 2. Update local state
      setProfileData({ ...editData });

      // 3. Update NextAuth session - FIXED VERSION
      const result = await update({
        ...session,
        user: {
          ...session?.user,
          name: editData.name,
          image: editData.image,
        },
      });

      console.log("Session update result:", result); // Debug log

      setIsEditing(false);
      setImagePreview(null);

      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
    setImagePreview(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProviderBadgeColor = (provider: string): string => {
    const colors: Record<string, string> = {
      google: "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400",
      github:
        "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400",
      credentials:
        "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400",
    };
    return colors[provider] || colors.credentials;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1], // same calm easing you use elsewhere
      }}
      className="min-h-screen bg-white dark:bg-[#181E2B] pt-4 px-4 pb-8"
    >
      <div className="max-w-4xl mx-auto pt-8">
        {/* Main Card */}
        <div className="bg-gray-50 dark:bg-[#171E26] rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
          {/* Cover Section */}
          <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-[#1F2C3B] dark:to-[#0F1419]"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-50 dark:border-zinc-900 bg-gray-200 dark:bg-zinc-800 overflow-hidden shadow-lg">
                  {imagePreview || editData.image || profileData.image ? (
                    <img
                      src={
                        imagePreview ||
                        editData.image ||
                        profileData.image ||
                        undefined
                      }
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
                    className={`absolute bottom-0 right-0 w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Camera className="w-5 h-5 text-white dark:text-black" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors font-medium"
                      disabled={uploadingImage}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={uploadingImage}
                    >
                      <Save className="w-4 h-4" />
                      {uploadingImage ? "Uploading..." : "Save Changes"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-[#1F2C3B] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-colors"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {profileData.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white dark:dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white flex-1">
                    {profileData.email}
                  </span>
                  {profileData.emailVerified && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 rounded-full font-medium">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Provider & Join Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sign-in Method
                  </label>
                  <div className="px-4 py-3 bg-white dark:dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getProviderBadgeColor(profileData.provider)}`}
                    >
                      {profileData.provider}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(profileData.joinedDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-gray-50 dark:dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Focus Sessions
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">
                {totalFocusSessions}
              </p>
            </div>
            <div className="bg-white dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hours Focused
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">
                {formatStudyTime(totalStudyHours)}
              </p>
            </div>
            <div className="bg-white dark:bg-[#1F2C3B] border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Streak
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">
                currently unavailable
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
