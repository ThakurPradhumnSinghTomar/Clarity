'use client'
import React from 'react'
import { Header } from "@repo/ui";



const layout = ({children} : { children: React.ReactNode }) => {
  
  
  return (
    
    <div className=''>
      <div className='fixed top-0 left-0 w-full z-50'><Header></Header></div>
      <div className='pt-[65px]'>
        {children}
      </div>
      </div>
  )
}

export default layout