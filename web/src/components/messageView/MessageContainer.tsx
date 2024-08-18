"use client";

import { MessageTemplate } from "@/app/messages";
import { useSocket } from "@/context/socketContext";
import { userInfoState } from "@/store/selectors/user-selector";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import i2 from "@/images/duf.webp";
import { currentMessagesState } from "@/store/atoms/messages-atom";
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
  const [message, setMessages] = useRecoilState(currentMessagesState);

  const renderMessages = () => {
    return message.map((m: MessageType) => {
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

  useEffect(() => {
    setMessages(() => messages);
    if (socket) {
      socket.emit("startConvo", { userId: id, guestId });
      socket?.on("newMessage", (newMsg: MessageType) => {
        console.log("got the new message here yeyeyeyey", newMsg.content);
        setMessages((prev) => [...prev, newMsg]);
      });
    }
  }, [socket]);
  return <div className="h-[85%]  overflow-y-scroll">{message.length > 0 && renderMessages()}</div>;
}
