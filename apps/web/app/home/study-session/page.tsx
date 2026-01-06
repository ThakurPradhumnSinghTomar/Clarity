"use client";

import React from "react";
import { Clock } from "@repo/ui";
import { motion } from "framer-motion";

const StudySession = () => {
  return (
    <main className="min-h-screen bg-[#F4F6F8] dark:bg-[#0F1419] transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1], // same calm easing you use elsewhere
        }}
        className="max-w-6xl mx-auto px-6 py-12 pt-0"
      >
        <Clock />
      </motion.div>
    </main>
  );
};

export default StudySession;
