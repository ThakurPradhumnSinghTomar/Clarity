"use client";

import { useState } from "react";
import { SignOutBtn } from "@repo/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@repo/context-providers";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./themeToggel";

const dropdownTransition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1] as const,
};

const Header = () => {
  const [isOptions, setisOptions] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const { mode } = useTheme();

  const isDark = mode === "dark";

  return (
    <div
      className="sticky top-3 z-50 mx-4 backdrop-blur-xl border rounded-2xl"
      style={{
        backgroundColor: isDark
          ? "rgba(54, 57, 70, 0.82)" // #363946 Gunmetal
          : "rgba(242, 245, 240, 0.78)",
        borderColor: isDark
          ? "rgba(129, 149, 149, 0.45)" // #819595 Cool Steel
          : "rgba(202, 207, 201, 0.6)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <div
          onClick={() => router.push("/home")}
          className="text-lg font-semibold tracking-tight cursor-pointer select-none transition"
          style={{
            color: isDark ? "#B1B6A6" : "#313630", // Ash Grey
          }}
        >
          Rebuild
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 text-sm font-medium">
          {/* HOME */}
          <div
            onClick={() => router.push("/home")}
            className="px-3 py-1.5 rounded-full cursor-pointer transition"
            style={{
              color: isDark ? "#B1B6A6" : "#495049",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? "rgba(105, 103, 115, 0.55)" // #696773 Dim Grey
                : "rgba(229, 234, 225, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Home
          </div>

          {/* OPTIONS */}
          <div
            className="relative"
            onMouseEnter={() => setisOptions(true)}
            onMouseLeave={() => setisOptions(false)}
          >
            <div
              className="px-3 py-1.5 rounded-full cursor-pointer transition"
              style={{
                color: isDark ? "#B1B6A6" : "#495049",
                backgroundColor: isOptions
                  ? isDark
                    ? "rgba(105, 103, 115, 0.55)"
                    : "rgba(229, 234, 225, 0.8)"
                  : "transparent",
              }}
            >
              Options
            </div>

            <AnimatePresence>
              {isOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -2, scale: 0.99 }}
                  transition={dropdownTransition}
                  className="absolute left-0 mt-3 w-56 rounded-2xl overflow-hidden backdrop-blur-2xl border shadow-xl"
                  style={{
                    backgroundColor: "rgba(54, 57, 70, 0.96)", // Gunmetal
                    borderColor: "rgba(129, 149, 149, 0.45)",
                  }}
                >
                  <div className="py-1">
                    {[
                      ["Study Session", "/home/study-session"],
                      ["Private Rooms", "/home/rooms"],
                      ["Habit Building", ""],
                      ["Track Expenses", ""],
                    ].map(([label, path]) => (
                      <div
                        key={label}
                        onClick={() => path && router.push(path)}
                        className="px-4 py-2 cursor-pointer transition"
                        style={{
                          color: "#B1B6A6",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(105, 103, 115, 0.55)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {label}
                      </div>
                    ))}

                    <div
                      className="mt-1 border-t"
                      style={{
                        borderColor: "rgba(129, 149, 149, 0.45)",
                      }}
                    >
                      <div className="px-4 py-2 transition">
                        <SignOutBtn />
                      </div>
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
              borderColor: isDark ? "#696773" : "#afb6af",
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
