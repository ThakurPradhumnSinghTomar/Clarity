"use client"
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

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
      setQuote("Working towards your dreams is hard. Not reaching them is harder.");
      setAuthor("William Shakespeare");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuote();
  }, []);

  return (
    <div className="max-w-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 p-6 rounded-xl border border-indigo-200 dark:border-zinc-700 shadow-lg md:min-w-[650px] relative overflow-hidden mb-4">
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 dark:bg-zinc-800 rounded-full -mr-16 -mt-16 opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Daily Inspiration</span>
        </div>
        
        {loading ? (
          <div>
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-700 animate-pulse rounded"></div>
            <div className="h-6 w-full bg-gray-200 dark:bg-zinc-700 animate-pulse rounded mt-2"></div>
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-zinc-700 animate-pulse rounded mt-4"></div>
          </div>
        ) : (
          <>
            <p className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
              "{quote}"
            </p>
            {author && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                — {author}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default QuoteBox;