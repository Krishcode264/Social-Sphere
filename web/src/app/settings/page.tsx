"use client";

import React from "react";
import useResetAllState from "@/hooks/useResetAllState";
import Cookies from "node_modules/@types/js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { userInfoState } from "@/store/selectors/user-selector";
const Page = () => {
  const resetAllState = useResetAllState();
  const router=useRouter()
  const {id}=useRecoilValue(userInfoState)
  const handleSignOut = async() => {
  

    window.sessionStorage.removeItem("token");
         await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/auth/logout`,{},{withCredentials:true});
        resetAllState();
        
    router.replace("/")
  };


  return (
    <div className="text-slate-300">
      settings page under dev...
      {id && (
        <button
          onClick={handleSignOut}
          className="p-2 bg-orange-500 text-slate-300"
        >
          sign out
        </button>
      )}
    </div>
  );
};

export default Page;
