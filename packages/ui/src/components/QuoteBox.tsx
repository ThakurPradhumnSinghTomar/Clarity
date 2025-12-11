"use client"
import React, { useEffect, useState } from 'react'

const QuoteBox = () => {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  const loadQuote = async () => {
    try {
      const r = await fetch("https://api.quotable.io/random");
      const d = await r.json();
      setQuote(d.en);
      setAuthor(d.author);
    } catch (e) {
      setQuote("Be not afraid of greatness: some are born great, some achieve greatness, and some have greatness thrust upon them.");
      setAuthor("William Shakespeare");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuote();
  }, []);

  return (
    <div className="max-w-xl bg-gray-50 dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-lg min-w-[650px]">
      {loading ? (
        <div>
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded"></div>
          <div className="h-6 w-full bg-gray-200 dark:bg-zinc-800 animate-pulse rounded mt-2"></div>
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded mt-4"></div>
        </div>
      ) : (
        <>
          <p className="text-xl font-medium text-gray-900 dark:text-white fade-slide-up">
            {quote}
          </p>

          {author && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 fade-slide-up">
              — {author}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default QuoteBox