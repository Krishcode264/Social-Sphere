import React from "react";
import { DetailedChatView } from "..";
import { ChatBar } from "@/components/messageView/ChatBar";

export const revalidate = 1;
const Page = ({ params }: { params: { guestId: string } }) => {
  return (
    <div className=" relative w-full h-full  bg-slate-900   flex-col  sm:justify-between p-0.5   sm:flex font-mono    ">
      <DetailedChatView id={params.guestId} />
      <ChatBar guestId={params.guestId}/>
    </div>
  );
};

export default Page;
