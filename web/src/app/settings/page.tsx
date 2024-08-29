"use client";

import React from "react";
import useResetAllState from "@/hooks/useResetAllState";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
const Page = () => {
  const resetAllState = useResetAllState();
  const router=useRouter()
  const handleSignOut = () => {
    resetAllState();
    Cookies.remove("token");
    window.sessionStorage.removeItem("token");
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
