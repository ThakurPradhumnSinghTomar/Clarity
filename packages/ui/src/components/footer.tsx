"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="mt-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        className="
          max-w-6xl mx-auto
          rounded-[3rem]
          bg-[#2b2f3f]
          text-white
          px-10 py-14
        "
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold tracking-tight">
              Rebuild
            </span>
          </div>

          {/* Primary links */}
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-white/90">
            <FooterLink label="Focus Room" />
            <FooterLink label="How it works" />
            <FooterLink label="Community" />
            <FooterLink label="Rules" />
            <FooterLink label="Blog" />
            <FooterLink label="Contact Us" />
            <FooterLink label="Mobile app" />
          </nav>

          {/* Secondary links */}
          <div className="flex gap-10 text-sm text-white/60 mt-2">
            <FooterLink label="Terms & Conditions" muted />
            <FooterLink label="Privacy Policy" muted />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-sm text-white/40">
          2025 © Knowledge Collective
        </div>
      </motion.div>
    </footer>
  );
};

/* ---------- helper ---------- */

function FooterLink({
  label,
  muted = false,
}: {
  label: string;
  muted?: boolean;
}) {
  return (
    <button
      className={`
        transition
        ${muted ? "hover:text-white/80" : "hover:text-white"}
      `}
    >
      {label}
    </button>
  );
}
