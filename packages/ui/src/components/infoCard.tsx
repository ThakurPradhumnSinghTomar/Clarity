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
        bg-white/70 dark:bg-[#151B22]/70
        border-[#CBD5E1] dark:border-[#334155]
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
      <h3 className="font-semibold text-lg text-[#0F172A] dark:text-[#E6EDF3] mb-2">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-[#64748B] dark:text-[#9FB0C0]">
        {description}
      </p>
    </div>
  );
};
