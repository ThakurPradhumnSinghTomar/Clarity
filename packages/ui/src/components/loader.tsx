"use client";

import { cn } from "@/lib/utils";

type LoaderProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-10 w-10 border-4",
  lg: "h-16 w-16 border-4",
};

export default function ClassicLoader({
  size = "md",
  className,
}: LoaderProps) {
  return (
    <div
      className={cn(
        "border-primary animate-spin rounded-full border-t-transparent",
        sizeMap[size],
        className
      )}
    />
  );
}
