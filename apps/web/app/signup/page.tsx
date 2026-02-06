"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, easeOut } from "framer-motion";
import { RebuildHero } from "@repo/ui";

/* ============================================
   CLOUDINARY CONFIGURATION
============================================ */
const CLOUDINARY_CLOUD_NAME = process.env
  .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
const CLOUDINARY_UPLOAD_PRESET = process.env
  .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;
const FALLBACK_IMAGE = process.env.NEXT_PUBLIC_FALLBACK_IMAGE as string;

export default function SignupPage() {
  const router = useRouter();

  /* ============================================
     STATE MANAGEMENT
  ============================================ */
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    imagePath: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { status } = useSession();

  /* ============================================
     CLOUDINARY UPLOAD
  ============================================ */
  const uploadToCloudinary = async (file: string | Blob) => {
    console.log("Cloudinary config:", {
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET,
      FALLBACK_IMAGE,
    });

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      return json.secure_url;
    } catch (err) {
      console.error("Cloudinary error:", err);
      return FALLBACK_IMAGE;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    const url = await uploadToCloudinary(file);
    setFormData({ ...formData, imagePath: url });
    setImagePreview(url);
    setUploadingImage(false);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imagePath: FALLBACK_IMAGE });
  };

  /* ============================================
     FORM SUBMISSION
  ============================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => router.push("/home"), 1500);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") router.push("/home");
  }, [status, router]);

  /* ============================================
     RENDER
  ============================================ */
  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-x-hidden">
      {/* LEFT – BRAND PANEL */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: easeOut }}
        className="relative hidden lg:flex flex-col justify-between px-16 py-20 bg-white"
      >
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop"
          alt="Focused workspace"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <RebuildHero></RebuildHero>
        </motion.div>
      </motion.div>

      {/* RIGHT – SIGNUP FORM */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="flex items-center justify-center p-8 bg-background"
      >
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-muted-foreground text-sm">
              Start rebuilding today
            </p>
          </div>

          {/* PROFILE IMAGE */}
          <div className="flex flex-col items-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  className="w-24 h-24 rounded-full object-cover border"
                />

                {/* LOADING OVERLAY DURING CLOUDINARY UPLOAD */}
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* REMOVE IMAGE BUTTON */}
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={uploadingImage}
                  className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full hover:bg-red-600 transition disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Upload />
              </label>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Profile photo (optional)
            </p>
          </div>

          {/* INPUTS */}
          <input
            placeholder="Full name"
            className="w-full h-12 px-4 rounded-md border"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            placeholder="Email"
            type="email"
            className="w-full h-12 px-4 rounded-md border"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <div className="relative">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="w-full h-12 px-4 pr-10 rounded-md border"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="cursor-pointer" />
              ) : (
                <Eye className="cursor-pointer" />
              )}
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-500/10 p-3 rounded">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="underline">
              Sign in
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
