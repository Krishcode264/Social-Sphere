"use client"
import { useSocket } from '@/context/socketContext'
import React from 'react'

const Page = () => {
  const socket=useSocket()
  const sendMessage=()=>{
socket?.emit("xxx",{text:"hey got the xxx ebvevnt "})
  }
  return (
    <div>
      <h1>demo page</h1>
      <button className='bg-red-500 p2' onClick={sendMessage} disabled={!socket}>
        send socket trigger 
      </button>
    </div>
  )
}

export default Page