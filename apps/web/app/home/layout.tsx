'use client'
import React from 'react'
import { useState } from 'react';

const layout = ({children} : { children: React.ReactNode }) => {
  const [isOptions, setisOptions] = useState(false);
  const [isMode, setisMode] = useState(false);

  
  return (
    
    <div>
      <div className=' dark:bg-[#020617] dark:text-white p-4 bg-[#FFFFFF] text-[#020617] flex justify-between'>
        <div className='ml-4 font-bold cursor-pointer text-2xl'>Rebuild</div>
        <div className='flex mr-4 pt-2'>
          <div className='dark:hover:text-[#9B350E] cursor-pointer mx-2'>Home</div>
          <div 
            className='relative'
            onMouseEnter={() => setisOptions(true)}
            onMouseLeave={() => setisOptions(false)}
          >
            <div className='dark:hover:text-[#9B350E] hover:text-orange-600 cursor-pointer mx-2 transition-colors duration-200'>
              Options
            </div>
            
            {/* Dropdown with smooth animation */}
            <div className={`
              absolute top-full left-0 min-w-[200px]
              bg-white dark:bg-[#0F172A] 
              rounded-xl shadow-xl
              border border-gray-100 dark:border-gray-800
              overflow-hidden
              transition-all duration-300 ease-in-out
              ${isOptions 
                ? 'opacity-100 translate-y-0 visible' 
                : 'opacity-0 -translate-y-2 invisible pointer-events-none'
              }
            `}>
              <div className='py-2'>
                <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-800'>
                  Study Session
                </div>
                <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-800'>
                  Weekly Planner
                </div>
                <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-800'>
                  Habbit Building
                </div>
                <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150'>
                  Track Expenses
                </div>
              </div>
            </div>
          </div>
          <div className='dark:hover:text-[#9B350E] cursor-pointer mx-2'>Profile</div>
          <div 
            className='relative'
            onMouseEnter={() => setisMode(true)}
            onMouseLeave={() => setisMode(false)}
          >
            <div className='dark:hover:text-[#9B350E] hover:text-orange-600 cursor-pointer mx-2 transition-colors duration-200'>
              Theme
            </div>
            
            {/* Dropdown with smooth animation */}
            <div className={`
              absolute top-full right-0 min-w-[200px]
              bg-white dark:bg-[#0F172A] 
              rounded-xl shadow-xl
              border border-gray-100 dark:border-gray-800
              overflow-hidden
              transition-all duration-300 ease-in-out 
              ${isMode 
                ? 'opacity-100 translate-y-0 visible' 
                : 'opacity-0 -translate-y-2 invisible pointer-events-none'
              }
            `}>
              <div className='py-2'>
                <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-800'>
                  System
                </div>
                <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-800'>
                  Light
                </div>
                <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-800'>
                  Dark
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {children}
      </div>
  )
}

export default layout