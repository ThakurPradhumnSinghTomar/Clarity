"use client";

export type CTASectionProps = {
  onStart: () => void;
};

export function CTASection({ onStart }: CTASectionProps) {
  return (
    <section
      className="
        rounded-3xl p-12 text-center border
        bg-white border-[#E2E8F0]
        dark:bg-[#151B22] dark:border-[#1F2933]
      "
    >
      <h2 className="text-3xl font-semibold mb-4">
        Ready to enter flow?
      </h2>

      <p className="text-[#64748B] dark:text-[#9FB0C0] max-w-xl mx-auto mb-8">
        One click. Timer on. Distractions out. Your future self will thank
        you.
      </p>

      <button
        onClick={onStart}
        className="
          h-12 px-8 rounded-full
          bg-[#4F6EF7] text-white hover:bg-[#3B5BDB]
          dark:bg-[#7C9AFF] dark:text-[#0F1419] dark:hover:bg-[#93AEFF]
          transition
        "
      >
        Start Study Session
      </button>
    </section>
  );
}
