"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const FALLBACK_IMAGE =
  process.env.NEXT_PUBLIC_FALLBACK_IMAGE as string;

export interface ProfileData {
  name: string;
  email: string;
  image: string | null;
  provider: "google" | "github" | "credentials" | "loading...";
  emailVerified: string;
  joinedDate: string;
}

export function useProfile() {
  const { data: session, update } = useSession();
  const token = session?.accessToken;

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "loading..",
    email: "loading..",
    image: null,
    provider: "credentials",
    emailVerified: "loading...",
    joinedDate: "loading...",
  });

  const [editData, setEditData] = useState<ProfileData>({
    ...profileData,
  });

  const [totalFocusSessions, setTotalFocusSessions] = useState(0);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  /* ================= FETCH PROFILE ================= */

  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-current-user-profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) return;

    const data = await res.json();
    const user = data.response;

    setProfileData({
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider,
      emailVerified: user.emailVerified,
      joinedDate: user.createdAt,
    });

    setEditData({
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider,
      emailVerified: user.emailVerified,
      joinedDate: user.createdAt,
    });

    setTotalFocusSessions(user.focusSessions.length);

    const seconds = user.focusSessions.reduce(
      (acc: number, s: { durationSec: number }) => acc + s.durationSec,
      0
    );
    setTotalStudySeconds(seconds);
  };

  /* ================= EDIT FLOW ================= */

  const startEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditData({ ...profileData });
    setImagePreview(null);
    setIsEditing(false);
  };

  /* ================= CLOUDINARY ================= */

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET!);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Cloudinary upload failed");
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    const reader = new FileReader();
    reader.onloadend = () =>
      setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const url = await uploadToCloudinary(file);
      setEditData((p) => ({ ...p, image: url }));
      setImagePreview(url);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setEditData((p) => ({ ...p, image: FALLBACK_IMAGE }));
  };

  /* ================= SAVE ================= */

  const saveProfile = async () => {
    const res = await fetch(
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

    if (!res.ok) throw new Error("Failed to save profile");

    setProfileData({ ...editData });
    setIsEditing(false);
    setImagePreview(null);

    await update({
      ...session,
      user: {
        ...session?.user,
        name: editData.name,
        image: editData.image,
      },
    });
  };

  const updatePassword = async () => {
    if (!token) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.oldPassword) {
      setPasswordError("Old password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setPasswordSuccess("Password updated successfully");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update password";
      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return {
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
    removeImage,
    passwordData,
    setPasswordData,
    passwordLoading,
    passwordError,
    passwordSuccess,
    updatePassword,
  };
}
