"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./../button";
import { Input } from "./../input";
import { Label } from "./../label";
import { Checkbox } from "./../checkbox";
import { Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import RebuildHero from "./RebuildHero";

/* =========================
   PROPS INTERFACE (NEW)
========================= */
interface LoginProps {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOAuth: (provider: "google" | "github") => void;
  onSignup: () => void;
  error: string;
  loading: boolean;
}

/* =========================
   PUPIL
========================= */
interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const getPos = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const rect = pupilRef.current.getBoundingClientRect();
    const dx = mouseX - (rect.left + rect.width / 2);
    const dy = mouseY - (rect.top + rect.height / 2);
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);

    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    };
  };

  const { x, y } = getPos();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: pupilColor,
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

/* =========================
   EYEBALL
========================= */
interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const getPos = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const rect = eyeRef.current.getBoundingClientRect();
    const dx = mouseX - (rect.left + rect.width / 2);
    const dy = mouseY - (rect.top + rect.height / 2);
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);

    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    };
  };

  const { x, y } = getPos();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: size,
        height: isBlinking ? 2 : size,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: pupilColor,
            transform: `translate(${x}px, ${y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
};

/* =========================
   MAIN LOGIN COMPONENT
========================= */
export function LoginPage({
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  onOAuth,
  onSignup,
  error,
  loading,
}: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT SIDE – BRAND / CONTEXT */}
      <div className="relative hidden lg:flex flex-col justify-between px-16 py-20 bg-white overflow-hidden">
        {/* Background Image */}
        <motion.img
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop"
          alt="Focused workspace"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Soft overlay for readability */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <RebuildHero></RebuildHero>
        </motion.div>
      </div>

      {/* RIGHT – FORM */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Please enter your details
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                placeholder="you@example.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="cursor-pointer"/> : <Eye className="cursor-pointer" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 cursor-pointer" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full h-12 cursor-pointer"
              onClick={() => onOAuth("google")}
            >
              <Mail className="mr-2 size-4" />
              Log in with Google
            </Button>
          </div>

          <div className="text-center text-sm mt-8">
            Don’t have an account?{" "}
            <button onClick={onSignup} className="font-medium hover:underline cursor-pointer">
              Sign up
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
