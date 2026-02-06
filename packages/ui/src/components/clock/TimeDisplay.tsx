"use client"
import { useAnimate } from "framer-motion";
import { useEffect, useRef } from "react";

export function TimeDisplay({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return (
    <div
      className="flex w-full max-w-4xl items-center justify-between rounded-2xl border border-[var(--color-border-strong)] backdrop-blur-xl px-6 py-10"
    >
      <TimeUnit label="Hours">
        <AnimatedDigit value={hours} />
      </TimeUnit>
      <TimeUnit label="Minutes">
        <AnimatedDigit value={minutes} />
      </TimeUnit>
      <TimeUnit label="Seconds">
        <AnimatedDigit value={seconds} />
      </TimeUnit>
    </div>
  );
}


function TimeUnit({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      {children}
      <span className="mt-2 text-sm text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="mt-4 h-px w-full bg-[var(--color-border-strong)]" />
    </div>
  );
}


function AnimatedDigit({ value }: { value: number }) {
  const [ref, animate] = useAnimate();
  const prev = useRef<number>(value);

  useEffect(() => {
    if (prev.current === value) return;

    const run = async () => {
      await animate(
        ref.current,
        { y: ["0%", "-50%"], opacity: [1, 0] },
        { duration: 0.25 },
      );
      prev.current = value;
      await animate(
        ref.current,
        { y: ["50%", "0%"], opacity: [0, 1] },
        { duration: 0.25 },
      );
    };

    run();
  }, [value, animate]);

  return (
    <span
      ref={ref}
      className="block font-mono text-4xl md:text-6xl font-semibold
             text-[var(--color-text)]"
    >
      {String(value).padStart(2, "0")}
    </span>
  );
}
