import React from 'react';
import { Trophy, Crown, Medal, Clock } from 'lucide-react';

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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-yellow-400 to-orange-500',
      'from-gray-300 to-gray-500',
      'from-amber-600 to-amber-800',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-green-500 to-emerald-500',
      'from-blue-500 to-cyan-500',
      'from-violet-500 to-purple-500',
    ];
    return gradients[index % gradients.length];
  };

  const sortedStudents = [...students].sort((a, b) => b.totalHours - a.totalHours);

  return (
    <div className='min-h-[608px] md:min-w-[800px] bg-white dark:bg-[#1F1F22] text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden mt-4 w-full transition-all duration-300'>
      
      {/* Header */}
      <div className='dark:bg-[#18181B] bg-[#B1B6A6] p-6'>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="dark:text-yellow-300 " size={32} />
          <h3 className="text-3xl font-bold dark:text-white">Leaderboard</h3>
        </div>
        <p className="dark:text-indigo-100">
          Compete with your friends and climb the ranks
        </p>
      </div>

      {/* Top 3 Podium */}
      {sortedStudents.length >= 2 && (
        <div className="flex items-end justify-center gap-4 px-6 py-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              {sortedStudents[1]?.image ? (
                <img 
                  src={sortedStudents[1].image} 
                  alt={sortedStudents[1].name}
                  className="w-16 h-16 rounded-full border-4 border-gray-300 object-cover"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full border-4 border-gray-300 bg-gradient-to-br ${getGradient(1)} flex items-center justify-center text-white font-bold text-lg`}>
                  {getInitials(sortedStudents[1]?.name || '')}
                </div>
              )}
              {sortedStudents[1]?.isFocusing && (
                <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
              )}
              <div className="absolute -bottom-2 -right-2 bg-gray-300 rounded-full p-1.5">
                <Medal className="text-gray-600" size={16} />
              </div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-t-lg px-4 py-3 h-20 flex flex-col items-center justify-center min-w-[100px]">
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">2</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                {formatStudyTime(sortedStudents[1]?.totalHours || 0)}
              </span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-4">
            <div className="relative mb-3">
              {sortedStudents[0]?.image ? (
                <img 
                  src={sortedStudents[0].image} 
                  alt={sortedStudents[0].name}
                  className="w-20 h-20 rounded-full border-4 border-yellow-400 object-cover"
                />
              ) : (
                <div className={`w-20 h-20 rounded-full border-4 border-yellow-400 bg-gradient-to-br ${getGradient(0)} flex items-center justify-center text-white font-bold text-xl`}>
                  {getInitials(sortedStudents[0]?.name || '')}
                </div>
              )}
              {sortedStudents[0]?.isFocusing && (
                <div className="absolute top-0 right-0 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
              )}
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-1.5">
                <Crown className="text-yellow-700" size={18} />
              </div>
            </div>
            <div className="bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-lg px-4 py-4 h-28 flex flex-col items-center justify-center min-w-[100px] shadow-lg">
              <span className="text-3xl font-bold text-yellow-900">1</span>
              <span className="text-xs font-semibold text-yellow-800 mt-1">
                {formatStudyTime(sortedStudents[0]?.totalHours || 0)}
              </span>
            </div>
          </div>

          {/* 3rd Place */}
          {sortedStudents.length >= 3 && sortedStudents[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                {sortedStudents[2].image ? (
                  <img 
                    src={sortedStudents[2].image} 
                    alt={sortedStudents[2].name}
                    className="w-16 h-16 rounded-full border-4 border-amber-700 object-cover"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-full border-4 border-amber-700 bg-gradient-to-br ${getGradient(2)} flex items-center justify-center text-white font-bold text-lg`}>
                    {getInitials(sortedStudents[2].name)}
                  </div>
                )}
                {sortedStudents[2].isFocusing && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
                <div className="absolute -bottom-2 -right-2 bg-amber-700 rounded-full p-1.5">
                  <Medal className="text-amber-200" size={16} />
                </div>
              </div>
              <div className="bg-amber-700 dark:bg-amber-800 rounded-t-lg px-4 py-3 h-16 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-2xl font-bold text-amber-100">3</span>
                <span className="text-xs font-medium text-amber-200 mt-1">
                  {formatStudyTime(sortedStudents[2].totalHours)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rest of Rankings */}
      <div className='overflow-y-auto max-h-[300px] px-6 pb-6 mt-2 scrollbar-hide'>
        <div className="space-y-2">
          {sortedStudents.slice(3).map((student, index) => {
            const actualRank = index + 4;
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 font-bold text-gray-700 dark:text-gray-300">
                  {actualRank}
                </div>
                
                <div className="relative">
                  {student.image ? (
                    <img 
                      src={student.image} 
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-500"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient(index + 3)} flex items-center justify-center text-white font-semibold`}>
                      {getInitials(student.name)}
                    </div>
                  )}
                  {student.isFocusing && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-700 rounded-full" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {student.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {student.isFocusing ? (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Focusing now..🔥
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Offline
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock size={16} />
                  <span className="font-semibold">{formatStudyTime(student.totalHours)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {sortedStudents.length === 0||1 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <Trophy size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Rankings Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {sortedStudents.length === 0?"Start studying to appear on the leaderboard!":"Need more than 1 member in room for rankings..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;