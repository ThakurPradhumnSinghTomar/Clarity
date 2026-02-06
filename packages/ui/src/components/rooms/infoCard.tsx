import React from "react";

interface InfoCardProps {
  icon: any;
  title: string;
  description: string;
  color?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon: Icon,
  title,
  description,
  color = "#7C9AFF",
}) => {
  return (
    <div
      className="
        rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300
        bg-[var(--color-surface)]/70
        border-[var(--color-border-strong)]
        hover:translate-y-[-1px]
      "
    >
      {/* ICON */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `${color}22`, // soft tint
          color,
        }}
      >
        <Icon size={22} strokeWidth={2} />
      </div>

      {/* CONTENT */}
      <h3 className="font-semibold text-lg text-[var(--color-text)] mb-2">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
        {description}
      </p>
    </div>
  );
};
