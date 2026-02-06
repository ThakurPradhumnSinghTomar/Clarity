import { motion } from "framer-motion";
import { OrbitalClock } from "@repo/ui";

export function HeroSection() {
  return (
    <div>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] mb-6">
            Daily Focus
          </p>

          <h1 className="text-4xl font-semibold leading-tight mb-6">
            Build consistency.
            <br />
            <span className="text-[var(--color-primary)]">
              Let the hours compound.
            </span>
          </h1>

          <p className="text-[var(--color-text-muted)] max-w-md">
            Track deep work, stay accountable with rooms, and enter flow without
            friction.
          </p>

          <a
            href="/home/study-session"
            className="mt-6 inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)]"
          >
            Go to Study Session
          </a>
        </motion.div>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
          <OrbitalClock />
        </div>
      </section>
    </div>
  );
}
