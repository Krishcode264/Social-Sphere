"use client"
import Loading from "@/components/basic/loading";
import MessageContainer, { type MessageType } from "@/components/messageView/MessageContainer";
import ProfilePic from "@/components/profile/profile_photo";
import p1 from "@/images/duf.webp";
import { fetchMessageHistory, getUserConvos } from "@/utils/fechers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image, { type StaticImageData } from "next/image";
import i2 from "@/images/duf.webp";
import { cache, Suspense } from "react";
import getTimeString from "@/utils/helpers/times";
import type { ConvoType } from "@/types/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRecoilValue } from "recoil";

import { userInfoState } from "@/store/selectors/user-selector";

// export const ChatHead:React.FC<ChatHeadProps> = ({convo}) => {
//   const {lastMsg,count}= useRecoilValue(newMessagesCountSelector(convo.guestId));
//   return (
//     <Link
//       href={`${process.env.BASE_URL}/messages/${convo.guestId}`}
//       className="flex  items-center justify-center gap-3  hover:bg-slate-700 hover:cursor-pointer md:p-1.5  bg:rounded-md rounded-lg md:justify-start min-w-12 h-12  w-full  bg-slate-900 "
//     >
//       <Image
//         src={convo.guestProfile || i2}
//         width={30}
//         height={30}
//         unoptimized={true}
//         alt="user"
//         className="rounded-full"
//       ></Image>

//       <p className="text-xl font-semibold hidden md:block text-slate-400 text-[16px] sm:text-[14px]">
//         {convo.guestName}
//       </p>
//       {count>0 && <Badge badgeContent={count} color="primary"/>}
//       <p className="text-xl font-semibold hidden md:block text-slate-400 text-[16px] sm:text-[14px]">
//         {lastMsg}
//       </p>
//     </Link>
//   );
// };



export const MessageTemplate = ({m,profile,name,status}:{m:MessageType,profile:string|StaticImageData,name?:string,status:string}) => {
  const {id}=useRecoilValue(userInfoState)
  return (
    <div className="flex  gap-3 hover:bg-slate-800 hover:cursor-pointer  p-2 rounded-md items- justify-start min-w-24 ">
      <Image
        src={profile}
        width={30}
        height={30}
        unoptimized={true}
        alt="user"
        className="rounded-full h-6 w-6 "
      ></Image>
      <div className="flex flex-col">
        <div className="flex gap-3 flex-row">
          <p className="  text-slate-500 font-semibold hover:text-slate-300 text-[16px] sm:text-[14px]">
            {name?.slice(0, 15)}
          </p>
          <span className="text-slate-600 text-[15px]">
            {getTimeString(m.timestamp, "en-IN")}
          </span>
          {m.recipient !== id && (
            <span
              className=" text-[13px] "
              style={{ color: `${status === "sent" ? "green" : "orange"}` }}
            >
              {status}
            </span>
          )}
        </div>
        <p className="text-slate-300  text-[16px] sm:text-[14px]">
          {m.content}
        </p>
      </div>
    </div>
  );
};

export type MessageTopBarProps = {
  name: string;
  profile: string;
  id: string;
};

export type MessageHistoryResponse = {
  guestInfo: MessageTopBarProps;
  messages: MessageType[];
};


