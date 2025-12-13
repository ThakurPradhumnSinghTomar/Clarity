import React from 'react';
import { Trophy, Users } from 'lucide-react';
import StudentCard from './studentCard';

interface Student {
  name: string;
  image?: string;
  totalHours: number;
}

interface LeaderboardProps {
  students: Student[];
}

const Leaderboard = ({ students }: LeaderboardProps) => {
  return (
    <div className='min-h-[608px] md:min-w-[800px] bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white rounded-2xl p-4 m-4 border border-gray-200 dark:border-zinc-800 shadow-lg'>
      
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="text-yellow-500" size={24} />
            <h3 className="text-2xl font-semibold">Leaderboard</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compete with your friends and climb the ranks
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Users size={18} className="text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            {students.length} Active
          </span>
        </div>
      </div>

      <div className='overflow-y-auto max-h-[440px] scrollbar-hide flex-col space-y-2'>
        {students.sort((a, b) => b.totalHours - a.totalHours).map((student, index) => (
          <StudentCard key={index} student={student} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;