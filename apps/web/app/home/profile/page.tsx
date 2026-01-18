"use client";
import { motion } from "framer-motion";
import { ProfileHeader } from "@repo/ui";
import { ProfileInfoSection } from "@repo/ui";
import { AccountStatsCard } from "@repo/ui";
import { useProfile } from "@/lib/hooks/profile/useProfile";

const ProfilePage = () => {
  const {
    profileData,
    editData,
    setEditData,
    isEditing,
    uploadingImage,
    imagePreview,
    totalFocusSessions,
    totalStudySeconds,
    startEdit,
    cancelEdit,
    saveProfile,
    handleImageChange,
  } = useProfile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="min-h-screen bg-white dark:bg-[#181E2B] pt-4 px-4 pb-8"
    >
      <div className="max-w-4xl mx-auto pt-8">
        {/* Main Card */}
        <div className="bg-gray-50 dark:bg-[#171E26] rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <ProfileHeader
            isEditing={isEditing}
            uploadingImage={uploadingImage}
            image={profileData.image}
            imagePreview={imagePreview}
            onEdit={startEdit}
            onCancel={cancelEdit}
            onSave={saveProfile}
            onImageChange={handleImageChange}
          />

          <div className="px-6 pb-6">
            <ProfileInfoSection
              isEditing={isEditing}
              profileData={profileData}
              editData={editData}
              setEditData={setEditData}
            />
          </div>
        </div>

        {/* Stats */}
        <AccountStatsCard
          totalFocusSessions={totalFocusSessions}
          totalStudySeconds={totalStudySeconds}
        />
      </div>
    </motion.div>
  );
};

export default ProfilePage;
