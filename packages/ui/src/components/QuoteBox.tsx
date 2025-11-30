"use client"
import React, { useEffect, useState } from 'react'

const QuoteBox = () => {

    const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  const loadQuote = async () => {
    try {
      const r = await fetch("https://api.quotable.io/random");
      const d = await r.json();
      setQuote(d.content);
      setAuthor(d.author);
    } catch (e) {
      setQuote("Be not afraid of greatness: some are born great, some achieve greatness, and some have greatness thrust upon them.");
      setAuthor("William Shakespeare");
    }
  };

  useEffect(() => {
    loadQuote();
  }, []);


  return (
    <div className="max-w-xl bg-[#F1F5F9] dark:bg-gray-900 p-6">
        <p className="text-xl font-medium text-gray-800 dark:text-gray-200 fade-slide-up">
          {quote}
        </p>
        {author && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 fade-slide-up">
            — {author}
          </p>
        )}
      </div>
  );
}

export default QuoteBox