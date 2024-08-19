import Image from 'next/image';
import React from 'react'
import i2 from "@/images/duf.webp"
import type { MessageTopBarProps } from '@/app/messages';
import CallIcon from "@mui/icons-material/Call";
import DuoIcon from "@mui/icons-material/Duo";
import Link from 'next/link';
const MessageTopBar = ({
  guestInfo:{profile,name},
  id
}: {
  guestInfo: MessageTopBarProps;
  id:string
}) => {
  return (
    <div className="text-slate-300 flex items-center hover:bg-slate-800 bg-slate-950 justify-between py-2 px-3 rounded-md sticky top-0  ">
      <div className="flex  items-center justify-center gap-2">
        <Image
          src={profile || i2}
          width={30}
          height={30}
          alt="user profile"
          unoptimized={true}
          className="rounded-full w-[30px] h-[30px] mx-auto "
        />

        <span className="text-center text-[10px]  sm:text-[14px] ">
          <Link href={`/profile/${id}`}> {name}</Link>

          <span className="text-slate-400 sm:text-[11px] md:text-[16px] mb:text-[10px] ml-4">(Last Seen 29 min ago)</span>
        </span>
      </div>
      <div className="flex gap-2">
        <button className="bg-blue-600 rounded-md py-1 px-2 text-slate-300 hover:text-slate-200">
          <CallIcon />
        </button>
        <button className="bg-blue-600 rounded-md py-1 px-2 text-slate-300 hover:text-slate-200">
          <DuoIcon />
        </button>
      </div>
    </div>
  );
};

export default MessageTopBar