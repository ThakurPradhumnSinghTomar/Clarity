"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@repo/context-providers";

const QuoteBox = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  const { mode } = useTheme();
  const isDark = mode === "dark";

  const loadQuote = async () => {
    try {
      const r = await fetch("https://api.quotable.io/random");
      const d = await r.json();
      setQuote(d.content);
      setAuthor(d.author);
    } catch (e) {
      setQuote("Working towards your dreams is hard. Not reaching them is harder.");
      setAuthor("William Shakespeare");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuote();
  }, []);

  return (
    <div
      className="mx-4 mb-4 max-w-3xl rounded-2xl border backdrop-blur-xl shadow-sm"
      style={{
        backgroundColor: isDark
          ? "rgba(54, 57, 70, 0.55)" // Gunmetal
          : "rgba(242, 245, 240, 0.7)", // soft-linen-50
        borderColor: isDark
          ? "rgba(129, 149, 149, 0.45)" // Cool Steel
          : "rgba(202, 207, 201, 0.6)", // ebony-200
      }}
    >
      <div className="px-8 py-7">
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between">
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{
              color: isDark ? "#819595" : "#626b61", // cool steel / ebony-600
            }}
          >
            Quote of the day
          </span>
        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div
                className="h-4 w-3/4 rounded-md animate-pulse"
                style={{
                  backgroundColor: isDark ? "#696773" : "#e4e7e4",
                }}
              />
              <div
                className="h-4 w-full rounded-md animate-pulse"
                style={{
                  backgroundColor: isDark ? "#696773" : "#e4e7e4",
                }}
              />
              <div
                className="h-3 w-1/3 rounded-md animate-pulse mt-5"
                style={{
                  backgroundColor: isDark ? "#696773" : "#e4e7e4",
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                className="text-lg leading-relaxed"
                style={{
                  color: isDark ? "#B1B6A6" : "#313630", // ash grey / ebony-800
                }}
              >
                “{quote}”
              </p>

              {author && (
                <p
                  className="mt-5 text-sm font-medium"
                  style={{
                    color: isDark ? "#819595" : "#626b61",
                  }}
                >
                  — {author}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuoteBox;
