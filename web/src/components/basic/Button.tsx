"use client"
import React from 'react'
import './Styles.css'
import { useRouter } from 'next/navigation';
export const Button = ({url,text,onClickProp}:{url?:string,text:string,onClickProp?:()=>void}) => {
  const router=useRouter()
  return (
    <button
      onClick={() => {
        router.push(`${url}`);
      }}
      className="px-2 p-1 bg-blue-600 rounded-2xl    text-slate-100 relative left-[80%]"
    >
    {text}
    </button>
  );
}

