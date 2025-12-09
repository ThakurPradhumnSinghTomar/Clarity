"use client"
import React from 'react'
import { useRouter } from "next/navigation" 
const mainPage = () => {
      const router = useRouter();
      router.push("/home");
  return (

    <div>mainPage</div>
  )
}

export default mainPage