"use client";
import { usePC } from "@/context/peerConnectionContext";
import { useSocket } from "@/context/socketContext";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { userBasicInfoState } from "@/store/atoms/user-atom";
import { playSound } from "@/utils/DomMutations/domMutations";
import React, { createElement, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { MessageTemplate } from "../messages";
const Page = () => {

const TestComponent=()=>{
  return(
    <div className="h-10 bg-red-500 p-2">
      <h1>hello this i stext component</h1>
    </div>
  )
}
const myRef=useRef(null)


  return (
    <div id="div" className="h-[600px] overflow-y-scroll bg-slate-900 border relative ">
    </div>
  );
};

export default Page;
