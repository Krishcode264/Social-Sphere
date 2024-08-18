import Loading from "@/components/basic/loading";
import MessageContainer, { type MessageType } from "@/components/messageView/MessageContainer";
import MessageTopBar from "@/components/messageView/MessageTopBar";
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

interface ChatHeadProps {
  convo: ConvoType;
}
export const ChatHead:React.FC<ChatHeadProps> = ({convo}) => {
  return (
    <Link
      href={`${process.env.BASE_URL}/messages/${convo.guestId}`}
      className="flex  items-center justify-center gap-3  hover:bg-slate-700 hover:cursor-pointer md:p-1.5  bg:rounded-md rounded-lg md:justify-start min-w-12 h-12  w-full  bg-slate-900 "
    >
      <Image
        src={convo.guestProfile || i2}
        width={30}
        height={30}
        unoptimized={true}
        alt="user"
        className="rounded-full"
      ></Image>

      <h2 className="text-xl font-semibold hidden md:block text-slate-400">
        {convo.guestName}
      </h2>
    </Link>
  );
};

export const ChatHeadContainer = async() => {
  const convos=await getUserConvos()
  console.log("convos here ",convos)
  return (
    <div className="py-2 px-1.5 overflow-y-scroll flex flex-col gap-2  w-[20%]  md:w-[20%] items-center md:items-start  ">
    {convos.length>0 && convos.map((convo:ConvoType)=>{
      return (
        <ChatHead convo={convo} key={convo.convoId}/>
      )
    })}
    </div>
  );
};

export const MessageTemplate = ({m,profile,name}:{m:MessageType,profile:string|StaticImageData,name?:string}) => {
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
          <h4 className="  text-slate-500 font-semibold hover:text-slate-300">
            {name?.slice(0, 15)}
          </h4>
          <span className="text-slate-600 text-[15px]">
            {getTimeString(m.timestamp,"en-IN")}
          </span>
        </div>

        <p className="text-slate-300">{m.content}</p>
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

export const DetailedChatView = async ({ id }: { id: string }) => {
  // const {data,isError,isLoading,isSuccess}=useQuery({  // not able to use tanstak query for async server compoennt
  //   queryKey:["user",id],
  //   queryFn:getUserChatHistory
  // })
   const data = await fetchMessageHistory(id);
  
  return (
    <Suspense fallback={<Loading />}>
      <div className=" flex flex-col gap-2 h-full overflow-y-scroll ">
        {data?.guestInfo && (
          <MessageTopBar guestInfo={data.guestInfo} id={id} />
        )}
        <MessageContainer guestId={id} guestProfile={data?.guestInfo.profile} guestName={data?.guestInfo.name} messages={data?.messages || []}/>
   
      </div>
    </Suspense>
  )
}
