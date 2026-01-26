import React from "react";

// import { ChatBar } from "@/components/messageView/ChatBar";
import { DetailedChatView } from "@/components/messageView/Message-Server";
import dynamic from "next/dynamic";
import { ChatBarAttachments, type ChatBarProps } from "@/components/messageView/ChatBar";

import { ChatBar } from "@/components/messageView/ChatBar"




const Page = ({ params }: { params: { guestId: string } }) => {

  return (
    <div className=" relative w-full h-full  bg-slate-900   flex-col sm:justify-between  p-0.5   flex font-mono    ">
      <DetailedChatView id={params.guestId} />

      <ChatBar guestId={params.guestId} />
    </div>
  );
};

export default Page;
