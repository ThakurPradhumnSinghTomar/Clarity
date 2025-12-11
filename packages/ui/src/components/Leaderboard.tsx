import React from 'react'
import {LeaderboardProps} from '@repo/types';
import StudentCard from './studentCard';

const Leaderboard = ({students}:LeaderboardProps) => {
    
  return (
    <div className='min-h-[600px] md:min-w-[800px] bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white rounded-2xl p-4 m-4 border border-gray-200 dark:border-zinc-800 shadow-lg'>
        
        <div className='mb-4'>
          <h3 className="text-2xl font-semibold">Leaderboard</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compete with your friends 
          </p>
        </div>

        <div className='overflow-y-auto max-h-[440px] scrollbar-hide flex-col'>
          {   
            students.sort((a, b) => b.totalHours - a.totalHours).map((student,index) => (
              <div key={index} className='m-2'>
                <StudentCard student={student} index={index}></StudentCard>
              </div>
            ))
          }
        </div>
    </div>
  )
}

export default Leaderboard;