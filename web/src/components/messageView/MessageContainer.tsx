"use client";

import { MessageTemplate, type MessageTopBarProps } from "@/app/messages";
import { useSocket } from "@/context/socketContext";
import { userInfoState } from "@/store/selectors/user-selector";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import i2 from "@/images/duf.webp";
import { currentMessagesState } from "@/store/atoms/messages-atom";
import { handleScrollDown, playSound } from "@/utils/DomMutations/domMutations";
import { generateRoomId } from "@/utils/helpers/helper";
import { MessageNotificationState } from "@/store/atoms/notificationState";
import { showComponentState } from "@/store/atoms/show-component";
import CallIcon from "@mui/icons-material/Call";
import DuoIcon from "@mui/icons-material/Duo";
import { CallWindowAtomState } from "@/store/atoms/callWindowStates";
import { guestState } from "@/store/atoms/guest-atom";
import { callState } from "@/store/atoms/calling-state";
export type MessageType = {
  id: string;
  sender: string;
  content: string;
  recipient: string;
  timestamp: string;
  status: string;
  roomId?: string;
  confirmationId?: string;
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
  const [msgs, setMessages] = useRecoilState(currentMessagesState);
  const updateConvoState=useSetRecoilState(MessageNotificationState)
  const convoStarted = useRef<boolean>(false);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
 
          updateConvoState((prev)=>{
            return {totalUnreadCount:0,unreadConvos:prev.unreadConvos.filter((convo)=>convo.guestId !== guestId)}
          }) 
  },[])
  useEffect(() => {
    
    if (socket) {
      if (!convoStarted.current) {
        socket.emit("startConvo", { userId: id, guestId });
        convoStarted.current = true;
      }

      socket?.on(
        `newMessage_${generateRoomId(id, guestId)}`,
        (newMsg: MessageType) => {
          console.log("got the new message here yeyeyeyey", newMsg.content);

          // msg can of me and can be of guest if its of me i have to update id from confirmation id and upsate status as sent
          setMessages((prev) => {
            console.log(id,newMsg, "new message id ");
            if (id === newMsg.sender) {
              //message si mine
              const beforeMsgIndex = prev.findIndex(
                (m) => m.id === newMsg.confirmationId
              ); //finding msg to confirm chnages
              if (beforeMsgIndex !== -1) {
                //update beforesmg.id to newmsg.id and returen new messagearfray with updated id of that perticular message
                console.log("updating message now ...")
                const updatedMessages = [...prev];
                updatedMessages[beforeMsgIndex] = {
                  ...updatedMessages[beforeMsgIndex],
                  id: newMsg.id,
                  status: "sent",
                };
                return updatedMessages;
              }
            } else {
              if (!prev.find((m) => m.id === newMsg.id)) {
                playSound();
                return [...prev, newMsg];
              }
            }
            return prev;
          });
          //if sender is not me then update the message aarray by adding new message
          //     if(prev.find((m)=>m.id===newMsg.confirmationId))

          //   if(!prev.find((m)=>m.id === newMsg.id)){
          //   playSound.play();
          //  return [...prev,newMsg]
          //   }
          //   return prev
          //   });
        }
      );
      return () => {
        socket.off(`newMessage_${generateRoomId(id, guestId)}`);
      };
    }
  }, [socket]);

  useEffect(() => {
    setMessages(() => [...messages]);
  }, []);

  useEffect(() => {
    handleScrollDown(messageContainerRef.current);
  }, [messageContainerRef, msgs]);
  const renderMessages = () => {
    return msgs.map((m: MessageType) => {
      return (
        <MessageTemplate
          m={m}
          key={m.timestamp}
          status={m.status}
          name={m.sender === id ? name : guestName}
          profile={m.sender === id ? profile || i2 : guestProfile || i2}
        />
      );
    });
  };

  return (
    <div ref={messageContainerRef} className="h-[85%]  overflow-y-scroll">
      {renderMessages()}
    </div>
  );
}


export const AudioVideoCallButton = ({
  state,
   id,
   profile,
   name
}: {
  state: "audio" | "video";
   id:string;
   profile:string;
   name:string;
}) => {
  const setShowCompennts = useSetRecoilState(showComponentState);
  const setMode = useSetRecoilState(CallWindowAtomState);
  const setPersonToHandshake = useSetRecoilState(guestState);
  const [call,setCall]=useRecoilState(callState)
    const activateCallWindow = () => {
if(call.status ==="default")  {
 setMode((prev) => ({ ...prev, mode: state }));
 setPersonToHandshake(() => ({ id, name, profile }));
//  setCall((prev)=> ({status:"calling" , action:"offerer"}))
 setShowCompennts((prev) => {
   return { ...prev, showCallWindow: true };
 });
}
   
  };
  return (
    <button
      className="bg-blue-600 rounded-md py-1 px-2 text-slate-300 hover:text-slate-200"
      onClick={activateCallWindow}
    >
      {state === "audio" ? <CallIcon /> : <DuoIcon />}
    </button>
  );
};

