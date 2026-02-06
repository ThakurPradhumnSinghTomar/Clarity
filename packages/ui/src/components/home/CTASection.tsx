"use client";

export type CTASectionProps = {
  onStart: () => void;
};

export function CTASection({ onStart }: CTASectionProps) {
  return (
    <section
      className="
        p-12 text-center border-2
        bg-white border-gray-200
        dark:bg-gray-900 dark:border-gray-700
        shadow-sm
      "
    >
      <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100 uppercase tracking-wide">
        Ready to enter flow?
      </h2>

      <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
        One click. Timer on. Distractions out. Your future self will thank
        you.
      </p>

      <button
        onClick={onStart}
        className="
          h-12 px-8
          bg-gradient-to-r from-blue-600 to-blue-700 text-white 
          hover:from-blue-700 hover:to-blue-800
          dark:bg-gradient-to-r dark:from-blue-600 dark:to-blue-700
          dark:hover:from-blue-700 dark:hover:to-blue-800
          transition-all
          border-2 border-blue-700
          font-bold uppercase tracking-wider text-sm
          shadow-md hover:shadow-lg
        "
      >
        Start Study Session
      </button>
    </section>
  );
}