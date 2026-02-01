"use client";

import { useState } from "react";
import { SignOutBtn } from "@repo/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@repo/context-providers";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./../themeToggel";

const dropdownTransition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1] as const,
};

const Header = () => {
  const [isOptions, setIsOptions] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="sticky top-4 z-50 mx-4 rounded-2xl backdrop-blur-xl border"
      style={{
        background: isDark ? "rgba(21,27,34,0.82)" : "rgba(255,255,255,0.75)",
        borderColor: isDark
          ? "rgba(129,149,149,0.35)"
          : "rgba(203,213,225,0.6)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <div
          onClick={() => router.push("/home")}
          className="cursor-pointer select-none text-lg font-semibold tracking-tight"
          style={{
            color: isDark ? "#E5E7EB" : "#0F172A",
          }}
        >
          Rebuild
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 text-sm font-medium">
          {/* HOME */}
          <motion.div
            whileHover={{ y: -1 }}
            onClick={() => router.push("/home")}
            className="px-3 py-1.5 rounded-full cursor-pointer transition"
            style={{
              color: isDark ? "#CBD5E1" : "#334155",
            }}
          >
            Home
          </motion.div>

          {/* OPTIONS */}
          <div
            className="relative"
            onMouseEnter={() => setIsOptions(true)}
            onMouseLeave={() => setIsOptions(false)}
          >
            <motion.div
              whileHover={{ y: -1 }}
              className="px-3 py-1.5 rounded-full cursor-pointer transition"
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
                background: isOptions
                  ? isDark
                    ? "rgba(125,211,252,0.12)"
                    : "rgba(59,130,246,0.08)"
                  : "transparent",
              }}
            >
              Options
            </motion.div>

            <AnimatePresence>
              {isOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 22,
                    mass: 0.6,
                  }}
                  className="absolute left-0 mt-3 w-56 rounded-2xl overflow-hidden backdrop-blur-2xl border shadow-xl"
                  style={{
                    background: isDark
                      ? "rgba(21,27,34,0.95)"
                      : "rgba(255,255,255,0.95)",
                    borderColor: isDark
                      ? "rgba(129,149,149,0.35)"
                      : "rgba(203,213,225,0.6)",
                  }}
                >
                  {[
                    ["Study Session", "/home/study-session"],
                    ["Private Rooms", "/home/rooms"],
                    ["Analytics","/home/analytics"],
                    ["Habit Building", ""],
                    ["Our Community", ""],
                  ].map(([label, path]) => {
                    const isLocked = !path;

                    return (
                      <div
                        key={label}
                        onClick={() => !isLocked && router.push(path)}
                        className={`px-4 py-2 transition flex items-center justify-between ${
                          isLocked
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                        style={{
                          color: isDark ? "#CBD5E1" : "#334155",
                        }}
                        onMouseEnter={(e) => {
                          if (isLocked) return;
                          e.currentTarget.style.background = isDark
                            ? "rgba(125,211,252,0.12)"
                            : "rgba(59,130,246,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          if (isLocked) return;
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span>{label}</span>

                        {isLocked && <span className="text-sm ml-3">🔒</span>}
                      </div>
                    );
                  })}

                  <div
                    className="mt-1 border-t"
                    style={{
                      borderColor: isDark
                        ? "rgba(129,149,149,0.35)"
                        : "rgba(203,213,225,0.6)",
                    }}
                  >
                    <div className="px-4 py-2">
                      <SignOutBtn />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* THEME TOGGLE */}
          <ThemeToggle />

          {/* PROFILE */}
          <div
            onClick={() => router.push("/home/profile")}
            className="ml-2 w-8 h-8 rounded-full overflow-hidden border cursor-pointer transition hover:opacity-80"
            style={{
              borderColor: isDark
                ? "rgba(125,211,252,0.4)"
                : "rgba(59,130,246,0.35)",
            }}
          >
            <img
              src={
                session?.user.image ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
