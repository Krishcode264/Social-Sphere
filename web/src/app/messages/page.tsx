"use client"
import Image from "next/image";
import i2 from '@/images/duf.webp'
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/basic/loading";
import type { User } from "@/types/types";
import { clsx } from "clsx";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CloseIcon from '@mui/icons-material/Close';

const ActionIcons = {
  friends: <MoreVertRoundedIcon />,
  sentRequests: <MoreVertRoundedIcon />,
  friendRequests: <MoreVertRoundedIcon />,
};
 export type currentListType = "friends" | "friendRequests" | "sentRequests";
const FriendListItemAction=({type}:{type:currentListType})=>{
  return(
ActionIcons[type]

  )
}
const FriendListItem = ({u}:{u:User}) => {

  return (
    <div className="flex  gap-3 items-center  hover:bg-slate-600   p-2 rounded-md items- justify-start min-w-24 ">
      <Image
        src={u.profile || i2}
        width={30}
        height={30}
        unoptimized={true}
        alt="user"
        className="rounded-full h-8 w-8 "
      ></Image>
      <div className="flex flex-col ">
        <div className="">
          <Link href={`/profile/${u.id}`}>
            <p className="  text-slate-300 font-semibold text-[16px] sm:text-[14px] hover:text-orange-500">
              {u.name}
            </p>
          </Link>
        </div>
        <p className="text-slate-300  text-[16px] sm:text-[14px]">
          {/* {notifytext[n.type]} */}
        </p>
      </div>
      <span className="ml-auto mr-2 text-orange-500 hover:cursor-pointer">
        
      
      </span>
    </div>
  );
};

const FriendListItemActionBar=()=>{
  return(
    <div className="border">
           
    </div>
  )
}

const Page = () => {

  type FriendListItomType={
    name:string;
    profile:string;
    id:string
  }


  const [currentList,setCurrentList]=useState<currentListType>("friends")

const fetchList = async () => {
  const userListdata = await axios.get(
    `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/relationlist/?type=${currentList}`,
    {
      withCredentials: true,
    }
  );

  return userListdata.data;
};


  const {
    isPending,
    error,
    data:userList,
    isFetching,
    isSuccess: fetchingSuccess,
  } = useQuery({
    queryKey: [currentList],
    queryFn: async () => await fetchList(),
  });


  
const renderUserList = () => {
  return userList.map((u:User) => {
    return <FriendListItem u={u}  key={u.id}/>;
  });
};
  return (
    <>
      <div className=" w-full  bg-slate-900   gap-3  p-2  h-full  font-mono">
        <div className="w-full mx-auto  md:w-[70%] my-5">
          <div
            className="w-full flex flex-col gap-2     "
            style={{
              alignItems:
                currentList === "friends"
                  ? "start"
                  : currentList === "friendRequests"
                  ? "center"
                  : "end",
            }}
          >
            <div className="w-full flex gap-2 justify-between  px-2 text-slate-300 ">
              <button
                className={`${clsx(
                  currentList === "friends"
                    ? "active-list text-orange-500 "
                    : ""
                )}`}
                onClick={(e) => setCurrentList("friends")}
              >
                Friends
              </button>
              <button
                className={`${clsx(
                  currentList === "friendRequests"
                    ? "active-list text-orange-500 "
                    : ""
                )}`}
                onClick={(e) => setCurrentList("friendRequests")}
              >
                Incoming Requests
              </button>
              <button
                className={`${clsx(
                  currentList === "sentRequests"
                    ? "active-list text-orange-500 "
                    : ""
                )}`}
                onClick={(e) => setCurrentList("sentRequests")}
              >
                Sent Requests
              </button>
            </div>

            {/* <div
              className="absolute bottom-0 h-[2px] bg-orange-500 transition-all duration-300"
              style={{ width: `${currentList.length * 10}px` }}
            ></div> */}
            {/* <div
              className="border w-44 border-orange-500 transition-all duration-300  "
              style={{ width: `${currentList.length * 9}px` }}
            ></div> */}
          </div>
          <div className="w-full h-[90%]  mt-4 overflow-y-scroll">
            {isFetching && <Loading />}
            {fetchingSuccess && userList.length > 0 ? (
              renderUserList()
            ) : (
              <p className="text-slate-300"> dont have anyone </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
