"use client";

import { Hero } from "@repo/ui";
import { ArrowRight, Timer, Users, LineChart } from "lucide-react";
import { motion, easeOut } from "framer-motion";


/* =========================
   ANIMATION VARIANTS
========================= */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
};

export default function HomePage() {
  return (
    <main className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 overflow-x-hidden">

      {/* HERO */}
      <Hero
        title="Rebuild Your Focus"
        description="A calm, intentional productivity system for students who want real progress —
        track habits, enter deep focus rooms, and rebuild discipline one session at a time."
      />

      {/* VALUE PROPS */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-6 grid md:grid-cols-3 gap-12">
        {[
          {
            icon: <Timer />,
            title: "Deep Focus Sessions",
            text: "Structured work sessions that actually respect your attention span.",
          },
          {
            icon: <Users />,
            title: "Private Study Rooms",
            text: "Work alone or with peers — zero noise, pure accountability.",
          },
          {
            icon: <LineChart />,
            title: "Progress That Makes Sense",
            text: "No dopamine traps. Just clean insights into your consistency.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="mb-4 text-neutral-600 dark:text-neutral-300">
              {item.icon}
            </div>
            <h3 className="text-lg font-medium mb-2">{item.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {item.text}
            </p>
          </motion.div>
        ))}
      </section>

      {/* HOW IT WORKS + CTA WRAPPER */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-16">

        {/* HOW IT WORKS */}
        <motion.section
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="pt-20 pb-12 max-w-md"
        >
          <h2 className="text-2xl font-light mb-10">
            Designed for Students, Not Influencers
          </h2>

          <div className="space-y-6">
            {[
              "Create focused habits instead of chasing streaks.",
              "Join rooms that align with how you actually study.",
              "Build consistency without burnout or noise.",
            ].map((text, i) => (
              <motion.div
                key={i}
                variants={fadeLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex items-start gap-3"
              >
                <div className="mt-2 h-2 w-2 rounded-full bg-neutral-400" />
                <p className="text-neutral-700 dark:text-neutral-300">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <section className="pt-24 pb-12 flex items-center">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="inline-flex flex-col items-start gap-6"
          >
            <h3 className="text-2xl font-light">
              Stop Planning. Start Rebuilding.
            </h3>

            <button className="inline-flex items-center gap-2 rounded-full cursor-pointer bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-6 py-3 text-sm transition-colors">
              Get Started
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="py-10 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Rebuild — Built for focused minds.
      </footer>

    </main>
  );
}
