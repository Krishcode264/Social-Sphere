"use client"
import React, { useEffect } from "react";
import Link from "next/link";
const AuthNav = ({text}:{text?:string}) => {
  useEffect(()=>{
window.sessionStorage.setItem("privousRoute", window.location.pathname);
  },[])
  return (
    <div className=" mx-auto bg-slate-900   text-slate-800  shadow-lg  p-6 w-3/5 md:w-1/2 m-auto flex flex-col items-center rounded-xl relative top-40 font-mono ">
      <h1 className="align-center text-center text-xl text-slate-400">
        {text ? text : "You need to Authenticate"}
      </h1>
      <div className="flex justify-between items-center  mx-auto gap-4 text-slate-500">
        <Link href="/login">
          <button className=" px-3 py-1.5  bg-slate-800 text-slate-300 rounded-lg mt-4 tracking-wide hover:bg-orange-500 hover:text-slate-200 ">
            Login
          </button>
        </Link>

        <Link href="/signup">
          <button className=" px-3 py-1.5 tracking-wide  bg-slate-800 text-slate-300   rounded-lg mt-4  hover:bg-orange-500 hover:text-slate-200">
            Signup
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AuthNav;
