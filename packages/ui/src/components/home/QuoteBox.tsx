"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QuoteBox = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  const loadQuote = async () => {
    try {
      const r = await fetch("https://api.quotable.io/random");
      const d = await r.json();
      setQuote(d.content);
      setAuthor(d.author);
    } catch (e) {
      setQuote(
        "Be not afraid of greatness: some are born great, some achieve greatness, and some have greatness thrust upon them."
      );
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
        backgroundColor:
          "color-mix(in srgb, var(--color-surface) 80%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--color-border) 70%, transparent)",
      }}
    >
      <div className="px-8 py-7">
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between">
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{
              color: "var(--color-text-muted)",
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
                  backgroundColor: "var(--color-surface-muted)",
                }}
              />
              <div
                className="h-4 w-full rounded-md animate-pulse"
                style={{
                  backgroundColor: "var(--color-surface-muted)",
                }}
              />
              <div
                className="h-3 w-1/3 rounded-md animate-pulse mt-5"
                style={{
                  backgroundColor: "var(--color-surface-muted)",
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
                  color: "var(--color-text)",
                }}
              >
                “{quote}”
              </p>

              {author && (
                <p
                  className="mt-5 text-sm font-medium"
                  style={{
                    color: "var(--color-text-muted)",
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
