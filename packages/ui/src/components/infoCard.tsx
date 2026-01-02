import React from 'react';

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
  color = '#10b981'
}) => {
  return (
    <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl p-7 shadow-md border-2 border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
      
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Icon size={28} className="text-white" strokeWidth={2.5} />
        </div>
        
        <div className="flex-1 pt-1">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed pl-0">
        {description}
      </p>
    </div>
  );
};