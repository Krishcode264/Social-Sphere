"use client";

import React from "react";
import useResetAllState from "@/hooks/useResetAllState";
import Cookies from "node_modules/@types/js-cookie";
import { useRouter } from "next/navigation";
import { API } from "@/utils/axios";
import { useRecoilValue } from "recoil";
import { userInfoState } from "@/store/selectors/user-selector";
const Page = () => {
  const resetAllState = useResetAllState();
  const router=useRouter()
  const {id}=useRecoilValue(userInfoState)
  const handleSignOut = async() => {
  

    window.sessionStorage.removeItem("token");
         await API.post(`/auth/logout`,{},{withCredentials:true});
        resetAllState();
        
    router.replace("/")
  };


  return (
    <div className="text-slate-300">
      
      {id && (
        <div className=" w-[50%]  bg-slate-600 rounded-xl  h-[30vh] mx-auto   translate-y-[20vh]">
   <button
          onClick={handleSignOut}
          className="p-2 w-[70%] rounded-lg   block  text-center hover:bg-orange-600  bg-orange-500  text-white mx-auto translate-y-[15vh]"
        >
          sign out
        </button>
        </div>
     
      )}
    </div>
  );
};

export default Page;
