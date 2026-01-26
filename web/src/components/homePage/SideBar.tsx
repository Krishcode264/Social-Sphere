"use client";
import React, { useEffect, useMemo } from "react";
import ProfilePic from "../profile/profile_photo";
import Link from "next/link";
import ChatIcon from "@mui/icons-material/Chat";
import { Badge, Icon } from "@mui/material";
import StreamIcon from "@mui/icons-material/Stream";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import Image from "next/image";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

import CircleNotificationsRoundedIcon from "@mui/icons-material/CircleNotificationsRounded";
import { userInfoState } from "@/store/selectors/user-selector";
import i2 from "@/images/duf.webp";
import { MessageNotificationState, NotificationState, TotalUnreadMessageCountSelector, type MessageNotificationType } from "@/store/atoms/notificationState";
import { usePath } from "@/context/pathContext";

export type SideBarOptionType = {
  name: string;
  icon: React.ReactNode;
  badge?: number;
};


const SideBarOption = ({ name, icon, badge }: SideBarOptionType) => {
  return (
    <Link
      key={name}
      href={`/${name.toLocaleLowerCase().split(" ").join("-")}`}
      className=" rounded-xl  hover:bg-slate-800 hover:cursor-pointer p-2"
    >
      <button className=" w-full  h-auto flex gap-2 items-center   mx-auto text-orange-100 ">
        {badge && badge > 0 ? (
          <Badge badgeContent={badge} color="primary">
            {icon}
          </Badge>
        ) : (
          icon
        )}
        <p className=" hidden lg:block  text-slate-400"> {name}</p>
      </button>
    </Link>
  );
};
const generateSideBarOptions = (
  options: { name: string; icon: React.ReactNode }[],
) => {
  return options.map((option) => {


    return <SideBarOption name={option.name} icon={option.icon} key={option.name} />;
  });
};

const Sidebarheader = () => {
  const { name, profile } = useRecoilValue(userInfoState);
  return (
    <div className="">
      <Link href={"/"}>
        <Image
          className=" h-10 w-10 rounded-full  mx-auto"
          src={profile || i2}
          alt="profile pic"
          width={15}
          height={15}
          unoptimized={true}
        />
        <h3 className="text-center sm:text-xl text-slate-400 font-bold hidden lg:block">
          {name}
        </h3>
      </Link>
    </div>
  );
};
//we have to show message badge so to avoid unnecessary rendering we are bwriting separate messagesideoption components 
const MessageSideBarOption = () => {
  const path = usePath()
  const msgs = useRecoilValue(TotalUnreadMessageCountSelector);;

  //  console.log("current path is chnaging from message ",path.startsWith("/messages"))

  return (
    <SideBarOption name={"Messages"} badge={path.startsWith("/messages/") ? 0 : msgs} icon={<ChatIcon />} />
  );
}


const NotificationsSideBarOption = () => {

  const notifications = useRecoilValue(NotificationState)

  return (
    <SideBarOption
      name={"Notification"}
      badge={notifications.length}
      icon={<CircleNotificationsRoundedIcon />}
    />
  );
}

const SideBar = () => {

  const icons = useMemo(
    () => [
      // { name: "Messages", icon: <ChatIcon /> },
      //  { name: "Feed", icon: <StreamIcon /> },
      // { name: "Rooms", icon: <GroupsIcon /> },
      { name: "My Profile", icon: <AccountCircleIcon /> },
      { name: "Settings", icon: <SettingsIcon /> },

      // { name: "Notification", icon: <CircleNotificationsRoundedIcon /> },
      // { name: "demo", icon: <SettingsIcon /> },
    ],
    []
  );
  console.log("side bar rerendered");
  useEffect(() => {

  }, [])

  return (
    <div className="rounded-lg h-full  md:w-[8%] p-2 lg:w-[15%] sm:p-2 flex flex-col   justify-start font-mono text-l   bg-gradient-to-br from-slate-900 to-slate-800  ">
      <Sidebarheader />
      <div className="flex flex-col gap-2 text-center  text-l mt-12  w-full  mx-auto">
        <MessageSideBarOption />
        {generateSideBarOptions(icons)}
        <NotificationsSideBarOption />
      </div>
    </div>
  );
};

export default SideBar;
