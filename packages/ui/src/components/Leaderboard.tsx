import React from 'react'

import {LeaderboardProps} from '@repo/types';
import StudentCard from './studentCard';

const Leaderboard = ({students}:LeaderboardProps) => {
    
  return (
    <div className='min-h-[600px] md:min-w-[800px]  bg-white dark:bg-[#0b1220] text-slate-900 dark:text-gray-200 rounded-2xl p-4 m-4'>
        
        <div className='mb-4'>
            <h3 className="text-2xl font-semibold">Leaderboard</h3>
          <p className="text-sm opacity-70 dark:opacity-60">
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