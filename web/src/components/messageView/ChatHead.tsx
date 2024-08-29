"use client"
import { TotalUnreadMessageCountSelector, UnViwedConvoSelector } from "@/store/atoms/notificationState";
import type { ConvoType } from "@/types/types";
import { Badge } from "@mui/material";
import { useRecoilValue } from "recoil";
import Image from "next/image";
import i2 from "@/images/duf.webp";
import Link from "next/link";
interface ChatHeadProps {
  convo: ConvoType;
}

export const ChatHead: React.FC<ChatHeadProps> = ({ convo }) => {
  const { lastMsg, count } = useRecoilValue(
    UnViwedConvoSelector(convo.guestId)
  );
 
  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_BASE_URL}/messages/${convo.guestId}`}
      className="flex md:items-start items-center justify-center md:gap-3 gap-1  hover:bg-slate-700 hover:cursor-pointer md:px-1.5 md:py-1 bg:rounded-md rounded-lg md:justify-start min-w-12 h-12  w-full  bg-slate-900"
    >
      <div className=" flex items-center justify-center md:items-start md:justify-start md:w-10 md:h-10">
        {count > 0 && <Badge badgeContent={count} color="primary" />}
        <Image
          src={convo.guestProfile || i2}
          width={5}
          height={5}
          unoptimized={true}
          alt="user"
          className="rounded-full w-10  "
        ></Image>
      </div>
      <div className=" flex-col items-center justify-center  hidden md:block m-0 h-12 w-full">
        <p className="font-semibold  text-slate-400 text-[21px] sm:text-[14px] m-0 p-0">
        {convo.guestName}
        </p>
        <p className="   overflow-ellipsis font-semibold  text-blue-300 text-[13px] sm:text-[12px] md:text-[14] m-0 p-0">
          { lastMsg && lastMsg.slice(0,15).concat("...") } 
        </p>
      </div>
    </Link>
  );
};
