import React from 'react';
import { Trophy, Clock } from 'lucide-react';

interface Student {
  name: string;
  image?: string;
  totalHours: number;
  isFocusing?: boolean;
}

interface LeaderboardProps {
  students: Student[];
}

const Leaderboard = ({ students }: LeaderboardProps) => {
  const formatStudyTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedStudents = [...students].sort((a, b) => b.totalHours - a.totalHours);

  return (
    <div className="mt-4 w-full rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-[#1F1F22] dark:text-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Trophy className="text-gray-700 dark:text-gray-200" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Leaderboard</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Simple ranking by study time.
            </p>
          </div>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {sortedStudents.length} members
        </span>
      </div>

      {sortedStudents.length > 1 && (
        <ul className="divide-y divide-gray-100 px-6 py-2 dark:divide-gray-800">
          {sortedStudents.map((student, index) => (
            <li key={student.name + index} className="flex items-center gap-4 py-4">
              <span className="w-6 text-sm font-semibold text-gray-500 dark:text-gray-400">
                {index + 1}
              </span>

              {student.image ? (
                <img
                  src={student.image}
                  alt={student.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {getInitials(student.name)}
                </div>
              )}

              <div className="flex-1">
                <p className="text-sm font-semibold">{student.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {student.isFocusing ? 'Focusing now..🔥' : 'Offline'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <Clock size={14} />
                <span>{formatStudyTime(student.totalHours)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {sortedStudents.length <= 1 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <Trophy size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Rankings Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {sortedStudents.length === 0
              ? 'Start studying to appear on the leaderboard!'
              : 'Need more than 1 member in room for rankings...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
