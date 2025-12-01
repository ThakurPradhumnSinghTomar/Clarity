import React from 'react'

import {LeaderboardProps} from '@repo/types';

const Leaderboard = ({students}:LeaderboardProps) => {
  return (
    <div className='min-h-[412px] md:min-w-[800px]  bg-white dark:bg-[#0b1220] text-slate-900 dark:text-gray-200 rounded-2xl p-4 m-4'>
        
        <div className='mb-4'>
            <h3 className="text-2xl font-semibold">Leaderboard</h3>
          <p className="text-sm opacity-70 dark:opacity-60">
            Compete with your friends 
          </p>
        </div>

        <div className='overflow-y-auto max-h-[440px] scrollbar-hide'>
            {
                students.sort((a, b) => b.studyHours - a.studyHours).map((student,index) => (
                    <div key={student.uid} className='flex justify-between p-2 m-2'>
                        <div className='flex justify-around gap-4'>
                            <div className='pt-2 font-bold'><h1>#{index+1}</h1></div>
                            <img
                            src={student.profileImg}
                            alt="profileimage"
                            className="h-10 w-10 rounded-full"
                            />
                            <div className='p-2'><p>{student.name}</p></div>
                            
                        </div>

                        <div>
                            <div><p>{student.studyHours}</p></div>
                        </div>
                    </div>
                ))
            }
        </div>

        <div className='p-4'>
            <h1>Your rank will show up here in upcoming version..</h1>
        </div>




        
    </div>
  )
}

export default Leaderboard;