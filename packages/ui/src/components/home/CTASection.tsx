"use client";

export type CTASectionProps = {
  onStart: () => void;
};

export function CTASection({ onStart }: CTASectionProps) {
  return (
    <section
      className="
        rounded-3xl p-12 text-center border
        bg-[var(--color-surface)] border-[var(--color-border)]
      "
    >
      <h2 className="text-3xl font-semibold mb-4">
        Ready to enter flow?
      </h2>

      <p className="text-[var(--color-text-muted)] max-w-xl mx-auto mb-8">
        One click. Timer on. Distractions out. Your future self will thank
        you.
      </p>

      <button
        onClick={onStart}
        className="
          h-12 px-8 rounded-full
          bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-strong)]
          transition
        "
      >
        Start Study Session
      </button>
    </section>
  );
}
