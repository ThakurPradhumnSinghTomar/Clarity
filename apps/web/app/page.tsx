"use client";

import { ArrowRight, Timer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%),
          url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1800&auto=format&fit=crop&q=80')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-white/10">
            <Timer className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Brand name */}
        <p className="text-white/60 tracking-[0.3em] uppercase text-xs mb-4 font-sans">
          Rebuild
        </p>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Reclaim your<br />focus.
        </h1>

        {/* Subtext */}
        <p className="text-white/70 text-lg mb-12 leading-relaxed font-sans font-light max-w-md mx-auto">
          A calm productivity system for students who want real progress — no noise, just deep work.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/signup")}
            className="px-8 py-3.5 rounded-full bg-white text-gray-900 font-semibold text-sm tracking-wide hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2 font-sans"
          >
            Get Started
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3.5 rounded-full border border-white/40 text-white font-semibold text-sm tracking-wide hover:bg-white/10 transition-all duration-200 font-sans"
          >
            Log In
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-white/40 text-xs font-sans tracking-wide">
          Free forever · No credit card required
        </p>
      </div>

      {/* Bottom footer */}
      <footer className="absolute bottom-0 left-0 right-0 px-8 py-5 flex justify-between items-center">
        <span className="text-white/30 text-xs font-sans">© {new Date().getFullYear()} Rebuild</span>
        <div className="flex gap-5">
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a key={link} href="#" className="text-white/30 text-xs font-sans hover:text-white/60 transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}