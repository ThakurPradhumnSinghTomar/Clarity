import React from 'react';
import { studentCardProps } from '@repo/types';

const StudentCard = ({ student, index }: studentCardProps) => {
    const getRankColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-500 dark:text-yellow-400';
        if (rank === 1) return 'text-slate-400 dark:text-slate-300';
        if (rank === 2) return 'text-amber-600 dark:text-amber-500';
        return 'text-slate-600 dark:text-slate-400';
    };

    const getRankBadge = (rank: number) => {
        if (rank === 0) return '🥇';
        if (rank === 1) return '🥈';
        if (rank === 2) return '🥉';
        return `#${rank + 1}`;
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Rank Badge */}
                <div className={`text-lg sm:text-2xl font-bold ${getRankColor(index)} min-w-9 sm:min-w-12 text-center`}>
                    {getRankBadge(index)}
                </div>

                {/* Profile Image */}
                <div className="relative flex shrink-0">
                    <img
                        src={student.profileImg||"https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt={student.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 dark:bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white dark:border-slate-800">
                        {index + 1}
                    </div>
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {student.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {student.totalHours} hours studied
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* View Profile Button */}
                    <button
                        className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
                        aria-label="View profile"
                    >
                        <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                    </button>

                    {/* Follow Button */}
                    <button
                        className="p-1.5 sm:p-2 rounded-lg bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors group"
                        aria-label="Follow"
                    >
                        <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentCard;