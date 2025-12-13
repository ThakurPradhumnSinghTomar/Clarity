import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon: Icon,
  title,
  description,
  color = '#6366f1'
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};