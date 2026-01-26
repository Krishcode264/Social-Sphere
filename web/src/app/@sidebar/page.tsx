"use client";
import React, { useEffect, useMemo } from "react";
import ProfilePic from "@/components/profile/profile_photo";
import Link from "next/link";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import Image from "next/image";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import defaultUserProfile from "@/images/user-profile.png";
import { useRecoilValue } from "recoil";
import { userBasicInfoState } from "@/store/atoms/user-atom";

import CircleNotificationsRoundedIcon from "@mui/icons-material/CircleNotificationsRounded";
const generateSideBarOptions = (
  options: { name: string; icon: React.ReactNode }[]
) => {
  return options.map((option) => {
    return (
      <Link
        key={option.name}
        href={`/${option.name.toLocaleLowerCase().split(" ").join("-")}`}
        className=" rounded-xl  hover:bg-slate-100 hover:cursor-pointer p-2 active:bg-slate-100"
      >
        <button className=" w-full  h-auto flex gap-2 items-center   mx-auto  text-orange-500 text-[100px]  bg-blue-400">
          {option.icon}

          <p className="  text-blue-600"> {option.name}</p>
        </button>
      </Link>
    );
  });
};

const Sidebarheader = () => {
  const user = useRecoilValue(userBasicInfoState);
  return (
    <>
      <Link href={"/"}>
        {/* <ProfilePic size={16} iconSize={50} src={user.profile} /> */}
        {/* <Image
          className="w-full h-full rounded-full   "
          src={user.profile || defaultUserProfile}
          alt="profile pic"
          width={15}
          height={15}
          unoptimized={true}
        /> */}
      </Link>

      <h3 className="text-center sm:text-xl text-blue-600 font-bold">
        {user.name}
      </h3>
    </>
  );
};

const Page = () => {
  const icons = [
    {
      name: "Messages",
      icon: <ChatIcon className="text-orange-500 text-[100px] bg-orange-500" />,
    },
    { name: "Rooms", icon: <GroupsIcon /> },
    { name: "My Profile", icon: <AccountCircleIcon /> },
    { name: "Friends", icon: <GroupsIcon /> },
    { name: "Settings", icon: <SettingsIcon /> },
    { name: "Notification", icon: <CircleNotificationsRoundedIcon /> },
  ];

  return (
    <div className="rounded-lg h-[90%] w-[8%]   md:w-[15%] sm:p-2 flex flex-col   justify-start  ">
      <Sidebarheader />
      <div className="flex flex-col gap-2 text-center  text-l mt-12  w-full  mx-auto">
        {generateSideBarOptions(icons)}
      </div>
    </div>
  );
};

export default Page;
