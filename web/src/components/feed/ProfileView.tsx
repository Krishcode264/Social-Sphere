"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FeedUserType } from "@/types/types";
import ProfilePic from "@/images/duf.webp";

interface UserInfoProps{
  name:string,
  age:number,
  location:string
}
const UserInfo=({name,age,location}:UserInfoProps)=>{
  return (

      <div className="absolute p-1 text-slate-100 font-semibold  bottom-0 left-0 translate-x-2">
        <p>
          {name} , <span>{age}</span>

        </p>
        <h1>{location}</h1>
      </div>

  );
}

export const PhotosPopup = ({user}:{user:FeedUserType}) => {

  return (
    <div
      className="relative w-60 h-60 "
    
    >

        <Image
          src={user.profile ||ProfilePic}
          width={100}
          height={100}
          className="w-full h-full rounded-xl"
          alt={""}
          unoptimized={true}
        />
 
      <div className=" bg-gradient-to-b hover:cursor-pointer hover:from-black/0  via-black/50  to-black/70 hover:to-black/100  absolute w-full h-full z-10  rounded-xl inset-0">
        {<UserInfo name={user.name} age={user.age} location={user.location} />}
      </div>
    </div>
  );
};


const ProfileView = ({user}:{user:FeedUserType}) => {

  return (
    <div className="relative w-60 h-60 ">
      <Image
        src={user.profile || ProfilePic}
        width={100}
        height={100}
        className="w-full h-full rounded-xl"
        alt={""}
        unoptimized={true}
      />

      <div className=" hover:bg-gradient-to-b hover:cursor-pointer hover:from-black/0  via-black/50  to-black/70 hover:to-black/100  absolute w-full h-full z-10  rounded-xl inset-0">
        {<UserInfo name={user.name} age={user.age} location={user.location} />}
      </div>
    </div>
  );
};

export default ProfileView;
