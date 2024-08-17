"use client"
import React from 'react'
import AuthNav from '@/components/profile/auth_nav';
import Loading from '@/components/basic/loading';
import { useRecoilValue } from 'recoil';
import { userBasicInfoState } from '@/store/atoms/user-atom';
import { ChatBar } from '@/components/messageView/ChatBar';
import { MessageTemplate, ChatHeadContainer } from '.';
import def from "@/images/duf.webp"
import { userInfoState } from '@/store/selectors/user-selector';



const DetailedChatView=()=>{
  return (
    <div className=" w-full  bg-slate-900  hidden flex-col gap-3 sm:justify-between p-2  h-full sm:flex font-mono">
      <div className=" flex flex-col gap-2">
        <MessageTemplate
          src={ ""}
          user="Dan Swartz"
          msg="hello how are you "
        />
        <MessageTemplate
          src="https://cdn.pixabay.com/photo/2023/04/21/15/42/portrait-7942151_640.jpg"
          user="someone"
          msg="i am good , what about you ? "
        />
      </div>
      <ChatBar />
    </div>
  );
}

const Page = () => {
const {id}=useRecoilValue(userInfoState)
    return (
      <div className='h-full from-slate-950  to-slate-800 bg-gradient-to-br'>
        {!id ? (
          <AuthNav text="you need to authenticate to see your friend's messages" />
        ) : (
          <div className='flex h-full'>
          
            <ChatHeadContainer />
            <DetailedChatView />
          </div>
        )} 
      </div>
    );
}

export default Page