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
          <p className="text-xs uppercase tracking-[0.4em] text-[#64748B] dark:text-[#9FB0C0] mb-6">
            Daily Focus
          </p>

          <h1 className="text-4xl font-semibold leading-tight mb-6">
            Build consistency.
            <br />
            <span className="text-[#4F6EF7] dark:text-[#7C9AFF]">
              Let the hours compound.
            </span>
          </h1>

          <p className="text-[#64748B] dark:text-[#9FB0C0] max-w-md">
            Track deep work, stay accountable with rooms, and enter flow without
            friction.
          </p>

          <a
            href="/home/study-session"
            className="mt-6 inline-flex rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F8FAFC] dark:border-[#1F2933] dark:bg-[#151B22] dark:text-[#E6EDF3] dark:hover:bg-[#1C2430]"
          >
            Go to Study Session
          </a>
        </motion.div>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 rounded-full bg-[#4F6EF7]/10 dark:bg-[#7C9AFF]/10 blur-3xl" />
          <OrbitalClock />
        </div>
      </section>
    </div>
  );
}
