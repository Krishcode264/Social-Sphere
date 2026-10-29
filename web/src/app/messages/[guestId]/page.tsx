"use client";
import React from "react";
import { DetailedChatView } from "@/components/messageView/Message-Server";
import { ChatBar } from "@/components/messageView/ChatBar";

const Page = ({ params }: { params: { guestId: string } }) => {

  return (
    <div className=" relative w-full h-full  bg-slate-900   flex-col sm:justify-between  p-0.5   flex font-mono    ">
      <DetailedChatView id={params.guestId} />

      <ChatBar guestId={params.guestId} />
    </div>
  );
};

export default Page;
