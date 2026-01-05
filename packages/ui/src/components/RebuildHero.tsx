"use client";
import { useTheme } from "@repo/context-providers";

export default function RebuildHero() {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <section className="pt-28 pb-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1
          className="
            text-4xl sm:text-5xl md:text-6xl
            font-semibold tracking-tight
            leading-tight text-gray-700
          "
        >
          Rebuild your focus,
          <br className="hidden sm:block" />
          habits & time
        </h1>

        <p
          className="
            mt-6
            max-w-2xl mx-auto
            text-base sm:text-lg
            leading-relaxed text-gray-500
          "
          
        >
          Rebuild is a calm productivity space for students —
          track study sessions, build habits, stay accountable in
          private rooms, and clearly understand where your time goes.
        </p>
      </div>
    </section>
  );
}
