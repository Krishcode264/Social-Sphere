"use client";

import React from "react";
import useResetAllState from "@/hooks/useResetAllState";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
const Page = () => {
  const resetAllState = useResetAllState();
  const router=useRouter()
  const handleSignOut = async() => {
  

    window.sessionStorage.removeItem("token");
         await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/auth/logout`,{},{withCredentials:true});
        resetAllState();
    router.replace("/")
  };

  return (
    <div>
      settings page
     
        <button onClick={handleSignOut} className="p-2 bg-red-500 text-slate-300">sign out</button>
    
    </div>
  );
};

export default Page;
