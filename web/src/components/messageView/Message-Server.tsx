import Image from 'next/image';
import React, { Suspense } from 'react'
import i2 from "@/images/duf.webp"
import type { MessageTopBarProps } from '@/app/messages';

import Link from 'next/link';
import type { ConvoType } from '@/types/types';
import { fetchMessageHistory, getUserConvos } from '@/utils/fechers';
import Loading from '../basic/loading';
import { ChatHead } from './ChatHead';
import MessageContainer, { AudioVideoCallButton } from './MessageContainer';
export const MessageTopBar = ({
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
          <Link href={`/profile/${id}`}> {name} </Link>

          <span className="text-slate-400 sm:text-[11px] md:text-[16px] mb:text-[10px] ml-4">
            (Last Seen 29 min ago)
          </span>
        </span>
      </div>
      <div className="flex gap-2">
        <AudioVideoCallButton
          state="audio"
          profile={profile}
          id={id}
          name={name}
        />
        <AudioVideoCallButton
          state="video"
          profile={profile}
          id={id}
          name={name}
        />
      </div>
    </div>
  );
};


    export const ChatHeadContainer = async () => {
      const convos = await getUserConvos();
      //  if(convos.length>0 ) redirect(`/messages/${convos[0].guestId}`)
      return (
        <Suspense fallback={<Loading />}>
          <div className="py-2 px-1.5 overflow-y-scroll flex flex-col gap-2  w-[20%]  md:w-[30%] items-center md:items-start  ">
            {convos.length > 0 &&
              convos.map((convo: ConvoType) => {
                return <ChatHead convo={convo} key={convo.convoId} />;
              })}
          </div>
        </Suspense>
      );
    };

export const DetailedChatView = async ({ id }: { id: string }) => {
  // const {data,isError,isLoading,isSuccess}=useQuery({  // not able to use tanstak query for async server compoennt
  //   queryKey:["user",id],
  //   queryFn:getUserChatHistory
  // })
  const data = await fetchMessageHistory(id);
//console.log(data?.messages,data?.guestInfo,"data at fetch messaage history")
  return (
    <Suspense fallback={<Loading />}>
      <div className=" flex flex-col gap-2 h-full overflow-y-scroll ">
        {data?.guestInfo && (
          <MessageTopBar guestInfo={data.guestInfo} id={id} />
        )}
        <MessageContainer
          guestId={id}
          guestProfile={data?.guestInfo.profile}
          guestName={data?.guestInfo.name}
     
        />
      </div>
    </Suspense>
  );
};

