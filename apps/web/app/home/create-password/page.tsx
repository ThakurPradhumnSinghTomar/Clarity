"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CreatePasswordPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!session?.accessToken) {
      setError("Unauthorized");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.accessToken,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to set password");
      }

      await update({
        ...session,
        user: {
          ...session.user,
          hasPassword: true,
        },
      });

      setSuccess("Password created successfully");
      router.push("/home");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to set password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-white dark:bg-[#181E2B]">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-gray-50 dark:bg-[#171E26] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Create your password
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You must create a password to continue.
        </p>

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1F2C3B] text-gray-900 dark:text-white"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1F2C3B] text-gray-900 dark:text-white"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-black disabled:opacity-70"
        >
          {loading ? "Saving..." : "Create password"}
        </button>
      </form>
    </div>
  );
}
