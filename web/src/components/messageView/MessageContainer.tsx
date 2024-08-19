"use client";

import { MessageTemplate } from "@/app/messages";
import { useSocket } from "@/context/socketContext";
import { userInfoState } from "@/store/selectors/user-selector";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import i2 from "@/images/duf.webp";
import { currentMessagesState } from "@/store/atoms/messages-atom";
import { handleScrollDown, playSound } from "@/utils/DomMutations/domMutations";
export type MessageType = {
  id: string;
  sender: string;
  content: string;
  recipient: string;
  timestamp: string;
  status?: string;
};
export interface MessageContainerProps {
  guestId: string;
  messages: MessageType[];
  guestProfile?: string;
  guestName?: string;
}
export default function MessageContainer({
  messages,
  guestProfile,
  guestId,
  guestName,
}: MessageContainerProps) {
  const socket = useSocket();
  const { id, profile, name } = useRecoilValue(userInfoState);
      const [msgs,setMessages] = useRecoilState(currentMessagesState);
      const convoStarted=useRef<boolean>(false)
const messageContainerRef=useRef<HTMLDivElement|null>(null)
useEffect(()=>{
    if (socket) {
      if(!convoStarted.current){
  socket.emit("startConvo", { userId: id, guestId });
  convoStarted.current=true
      }
    
      socket?.on("newMessage", (newMsg: MessageType) => {
        console.log("got the new message here yeyeyeyey", newMsg.content);
       
        setMessages((prev) => {
          console.log(newMsg.id,"new message id ")
          if(!prev.find((m)=>m.id === newMsg.id)){
          playSound.play();
         return [...prev,newMsg]
          }
          return prev
        });
   
      });
    }
},[socket])

  useEffect(() => {
setMessages(()=>[...messages])

  }, []);


  useEffect(()=>{
handleScrollDown(messageContainerRef.current)
  },[messageContainerRef,msgs])
    const renderMessages = () => {

      return msgs.map((m: MessageType) => {
        return (
          <MessageTemplate
            m={m}
            key={m.id}
            name={m.sender === id ? name : guestName}
            profile={m.sender === id ? profile || i2 : guestProfile || i2}
          />
        );
      });
    };


  return <div ref={messageContainerRef} className="h-[85%]  overflow-y-scroll">{renderMessages()}</div>;
}
