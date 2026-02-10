"use client";

import { Hero } from "@repo/ui";
import { ArrowRight, Timer, Users, LineChart, Sparkles } from "lucide-react";
import { motion, easeOut } from "framer-motion";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* =========================
   PARTICLE ANIMATION
========================= */
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle (blue theme)
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 0 }}
    />
  );
};

/* =========================
   GRADIENT ORBS
========================= */
const GradientOrbs = () => (
  <>
    <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px] animate-pulse" />
    <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
  </>
);

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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const router = useRouter();
  return (
    <main className="relative bg-white text-gray-900 overflow-x-hidden min-h-screen">
      {/* Background Effects */}
      <ParticleBackground />
      <GradientOrbs />

      {/* Content - with relative positioning to appear above background */}
      <div className="relative z-10">
        {/* HERO SECTION */}
        
        <section className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mx-auto mb-8 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30"
            >
              <Timer className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent"
            >
              Rebuild Your Focus
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              A calm, intentional productivity system for students who want real progress —
              track habits, enter deep focus rooms, and rebuild discipline one session at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button onClick={() => router.push("/login")}  className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                LogIn
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button onClick={() => router.push("/signup")} className="px-8 py-4 rounded-full border-2 border-gray-300 hover:border-blue-500 text-gray-700 font-semibold text-lg transition-all duration-300 hover:bg-gray-50">
                SignUp
              </button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-20"
            >
              <div className="w-6 h-10 border-2 border-gray-300 rounded-full mx-auto flex justify-center p-1">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* VALUE PROPS */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Timer className="w-8 h-8" />,
                title: "Deep Focus Sessions",
                text: "Structured work sessions that actually respect your attention span. No interruptions, just pure concentration.",
                gradient: "from-blue-50 to-blue-100/50",
                border: "border-blue-200",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Private Study Rooms",
                text: "Work alone or with peers — zero noise, pure accountability. Build focus together.",
                gradient: "from-blue-50 to-indigo-100/50",
                border: "border-blue-200",
              },
              {
                icon: <LineChart className="w-8 h-8" />,
                title: "Progress That Makes Sense",
                text: "No dopamine traps. Just clean insights into your consistency and real growth over time.",
                gradient: "from-indigo-50 to-blue-100/50",
                border: "border-blue-200",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`group relative rounded-2xl border ${item.border} bg-gradient-to-br ${item.gradient} backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="relative">
                  <div className="mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-6 py-24 bg-gray-50/50 rounded-3xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Designed for Students, Not Influencers
            </h2>
            <p className="text-xl text-gray-600">
              Real productivity without the noise
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                number: "01",
                text: "Create focused habits instead of chasing streaks.",
              },
              {
                number: "02",
                text: "Join rooms that align with how you actually study.",
              },
              {
                number: "03",
                text: "Build consistency without burnout or noise.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex flex-col items-start gap-4 p-6 rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-colors shadow-sm hover:shadow-md"
              >
                <span className="text-5xl font-bold text-blue-200">
                  {item.number}
                </span>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 px-6">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center relative"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-3xl rounded-full" />
            
            <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-12 md:p-16 shadow-xl">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              
              <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Stop Planning. Start Rebuilding.
              </h3>
              
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Join thousands of students who are reclaiming their focus and building real, lasting productivity habits.
              </p>

              <button  onClick={() => router.push("/signup")} className="group px-10 py-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 inline-flex items-center gap-3">
                Get Started Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <p className="mt-6 text-sm text-gray-500">
                Free forever. No credit card required.
              </p>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-gray-200 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Rebuild
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                © {new Date().getFullYear()} Rebuild — Built for focused minds.
              </div>
              
              <div className="flex gap-6 text-sm text-gray-600">
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}