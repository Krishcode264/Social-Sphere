"use client"
import { useSocket } from '@/context/socketContext'
import { playSound } from '@/utils/DomMutations/domMutations'
import React, { useRef } from 'react'


const Page = () => {
  const socket=useSocket()
  const sendMessage=()=>{
socket?.emit("xxx",{text:"hey got the xxx ebvevnt "})
  }
  const demoRef=useRef<null|HTMLDivElement>(null)
 const handleScrollDown = (ref:HTMLDivElement|null) => {
  if(ref){
   
const divSh=ref.scrollHeight;
playSound.play()
ref.scrollBy({ top: divSh, behavior: "smooth" });
  }

 };
  return (
    <div ref={demoRef} className="h-[600px] overflow-y-scroll bg-white">
      <div className="min-h-[200px] bg-blue-800">
        <button onClick={()=>handleScrollDown(demoRef.current)} className='bg-red-500 p-2 rounded-xl'>go to bottom</button>
      </div>
      <div className="min-h-[200px] bg-blue-600"></div>
      <div className="min-h-[200px] bg-blue-800"></div>
      <div className="min-h-[200px] bg-blue-600"></div>
      <div className="min-h-[200px] bg-blue-800"></div>
      <div className="min-h-[200px] bg-blue-600"></div>
      <div className="min-h-[200px] bg-blue-900"></div>
      {/* <h1>demo page</h1> */}
      {/* <button
        className="bg-red-500 p2"
        onClick={sendMessage}
        disabled={!socket}
      >
        send socket trigger
      </button> */}
    </div>
  );
}

export default Page