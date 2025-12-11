"use client"
import React, { useState } from 'react';
import { Camera, Mail, User, Calendar, Check, X, Edit2, Save } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  image: string | null;
  provider: 'google' | 'github' | 'credentials';
  emailVerified: string;
  joinedDate: string;
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: null,
    provider: 'google',
    emailVerified: '2024-01-15T10:30:00.000Z',
    joinedDate: '2024-01-15T10:30:00.000Z'
  });

  const [editData, setEditData] = useState<ProfileData>({ ...profileData });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setEditData({ ...editData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setProfileData({ ...editData });
    setIsEditing(false);
    setImagePreview(null);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
    setImagePreview(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProviderBadgeColor = (provider: string): string => {
    const colors: Record<string, string> = {
      google: 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400',
      github: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400',
      credentials: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400'
    };
    return colors[provider] || colors.credentials;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-4 px-4 pb-8">
      <div className="max-w-4xl mx-auto pt-8">
      

        {/* Main Card */}
        <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
          {/* Cover Section */}
          <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-zinc-800 dark:to-black"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-50 dark:border-zinc-900 bg-gray-200 dark:bg-zinc-800 overflow-hidden shadow-lg">
                  {(imagePreview || profileData.image) ? (
                    <img
                      src={imagePreview || profileData.image || undefined}
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
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg">
                    <Camera className="w-5 h-5 text-white dark:text-black" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
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
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
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
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-colors"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{profileData.name}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white flex-1">{profileData.email}</span>
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
                  <div className="px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getProviderBadgeColor(profileData.provider)}`}>
                      {profileData.provider}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg">
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
        <div className="mt-6 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Focus Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Hours Focused</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0h</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;