"use client"
import React from 'react'
import {QuoteBox} from '@repo/ui'
import { Histogram } from '@repo/ui'
import {Leaderboard} from '@repo/ui'
import {dummyStudents} from '@repo/types'



const home = () => {
  
  return (
    <div className='min-h-[675px]  pt-10'>
    
      <div className='md:flex md:justify-around'>
          <div className='p-4 md:min-w-2xl'>
          <div className='min-h-[185px]'><QuoteBox></QuoteBox></div>
          <Histogram></Histogram>
          </div>



           <div>
            <Leaderboard students={dummyStudents}></Leaderboard>
          </div>
      
      </div>

     
      
      
    </div>
  )
}

export default home