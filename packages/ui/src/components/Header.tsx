"use client";

import { useState, useEffect } from "react";
import { SignOutBtn } from "@repo/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@repo/context-providers";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./themeToggel";

const navItems = [
  { label: "Home", path: "/home", icon: "🏠" },
  { label: "Study Session", path: "/home/study-session", icon: "📚" },
  { label: "Private Rooms", path: "/home/rooms", icon: "🚪" },
  { label: "Habit Building", path: "", icon: "🎯" },
  { label: "Our Community", path: "", icon: "👥" },
];

const Header = () => {
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenu(false);
  }, [router]);

  const colors = {
    bg: isDark
      ? scrolled
        ? "rgba(15,23,42,0.95)"
        : "rgba(15,23,42,0.85)"
      : scrolled
      ? "rgba(255,255,255,0.98)"
      : "rgba(255,255,255,0.9)",
    border: isDark ? "rgba(100,116,139,0.25)" : "rgba(226,232,240,0.8)",
    text: isDark ? "#F1F5F9" : "#0F172A",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    hoverBg: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)",
    activeBg: isDark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.12)",
    navBg: isDark ? "rgba(30,41,59,0.5)" : "rgba(248,250,252,0.9)",
    gradientFrom: isDark ? "#6366F1" : "#6366F1",
    gradientTo: isDark ? "#8B5CF6" : "#A855F7",
  };

  return (
    <>
      {/* Header Container */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
          scrolled ? "shadow-lg" : "shadow-md"
        }`}
        style={{
          background: colors.bg,
          borderColor: colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* LOGO */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/home")}
              className="cursor-pointer flex items-center gap-2 shrink-0"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors.gradientFrom}, ${colors.gradientTo})`,
                }}
              >
                R
              </div>
              <span
                className="text-lg font-bold hidden sm:block"
                style={{ color: colors.text }}
              >
                Rebuild
              </span>
            </motion.div>

            {/* DESKTOP NAV */}
            <nav
              className="hidden lg:flex items-center gap-1 px-2 py-2 rounded-xl border"
              style={{
                background: colors.navBg,
                borderColor: colors.border,
              }}
            >
              {navItems.map((item) => {
                const locked = !item.path;

                return (
                  <motion.button
                    key={item.label}
                    whileHover={!locked ? { y: -2 } : {}}
                    whileTap={!locked ? { scale: 0.97 } : {}}
                    onClick={() => !locked && router.push(item.path)}
                    disabled={locked}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      locked
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                    style={{ color: locked ? colors.textMuted : colors.text }}
                    onMouseEnter={(e) => {
                      if (!locked) e.currentTarget.style.background = colors.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="hidden xl:inline">{item.label}</span>
                    {locked && <span className="text-xs">🔒</span>}
                  </motion.button>
                );
              })}
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Theme Toggle */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Desktop Logout */}
              <div
                className="hidden lg:block px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:shadow-md"
                style={{
                  borderColor: colors.border,
                  color: isDark ? "#FCA5A5" : "#DC2626",
                  background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)",
                }}
              >
                <SignOutBtn />
              </div>

              {/* Profile Picture */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/home/profile")}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer ring-2 ring-offset-2 transition-all hover:ring-offset-4"
                style={{
                  borderColor: colors.gradientFrom,
                  ringColor: isDark
                    ? "rgba(99,102,241,0.3)"
                    : "rgba(99,102,241,0.2)",
                  ringOffsetColor: isDark ? "#0F172A" : "#FFFFFF",
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
                {/* Online indicator */}
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    background: "#10B981",
                    borderColor: colors.bg,
                  }}
                />
              </motion.div>

              {/* MOBILE MENU BUTTON */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="lg:hidden p-2 rounded-lg border transition-all hover:shadow-md"
                style={{
                  borderColor: colors.border,
                  background: colors.navBg,
                }}
                onClick={() => setIsMobileMenu((p) => !p)}
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={isMobileMenu ? "open" : "closed"}
                  className="flex flex-col gap-1.5 w-5"
                >
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: 45, y: 8 },
                    }}
                    className="w-full h-0.5 rounded-full transition-all"
                    style={{ background: colors.text }}
                  />
                  <motion.span
                    variants={{
                      closed: { opacity: 1 },
                      open: { opacity: 0 },
                    }}
                    className="w-full h-0.5 rounded-full transition-all"
                    style={{ background: colors.text }}
                  />
                  <motion.span
                    variants={{
                      closed: { rotate: 0, y: 0 },
                      open: { rotate: -45, y: -8 },
                    }}
                    className="w-full h-0.5 rounded-full transition-all"
                    style={{ background: colors.text }}
                  />
                </motion.div>
              </motion.button>
            </div>
          </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
            {isMobileMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden border-t overflow-hidden"
                style={{ borderColor: colors.border }}
              >
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => item.path && router.push(item.path)}
                      className={`px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                        item.path
                          ? "cursor-pointer active:scale-95"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      style={{
                        color: colors.text,
                        background: item.path ? "transparent" : colors.navBg,
                      }}
                      onMouseEnter={(e) => {
                        if (item.path) e.currentTarget.style.background = colors.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                      {!item.path && <span className="ml-auto text-sm">🔒</span>}
                    </motion.div>
                  ))}

                  {/* Mobile Theme Toggle */}
                  <div className="sm:hidden pt-2 border-t" style={{ borderColor: colors.border }}>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="font-medium" style={{ color: colors.text }}>
                        Theme
                      </span>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* MOBILE LOGOUT */}
                  <div className="pt-2 border-t" style={{ borderColor: colors.border }}>
                    <div
                      className="px-4 py-3 rounded-lg font-medium transition-all"
                      style={{
                        color: isDark ? "#FCA5A5" : "#DC2626",
                        background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)",
                      }}
                    >
                      <SignOutBtn />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </motion.header>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenu(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;