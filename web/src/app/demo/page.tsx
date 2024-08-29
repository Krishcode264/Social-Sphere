"use client";
import { usePC } from "@/context/peerConnectionContext";
import { useSocket } from "@/context/socketContext";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { userBasicInfoState } from "@/store/atoms/user-atom";
import { playSound } from "@/utils/DomMutations/domMutations";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

const Page = () => {


  return (
    <div className="h-[600px] overflow-y-scroll bg-slate-900">
      <button className="bg-red-500 p-2 rounded-xl" >
      demo page 
      </button>
   
    </div>
  );
};

export default Page;
