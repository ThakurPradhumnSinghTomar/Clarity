'use client'
import React from 'react'
import {Clock} from '@repo/ui'
import { dummyTimer } from '@repo/types'

const studySession = () => {
  return (
    <div>
        <Clock /> {/* <---remember we have to pass props like this  */}
    </div>
  )
}

export default studySession