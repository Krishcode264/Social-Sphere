"use client";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useEffect, useRef, useState } from "react";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import GifBoxIcon from "@mui/icons-material/GifBox";
import SendIcon from "@mui/icons-material/Send";
import { useSocket } from "@/context/socketContext";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userInfoState } from "@/store/selectors/user-selector";
import { currentMessagesState } from "@/store/atoms/messages-atom";
import type { MessageType } from "./MessageContainer";
import { randomUUID } from "crypto";
import { v4 } from "uuid";
import { generateRoomId } from "@/utils/helpers/helper";
export const ChatBar = ({ guestId }: { guestId: string }) => {
  return (
    <div className="bg-slate-800  rounded-md  gap-2 shadow-sm sm:w-[80%] mr-auto w-full flex items-center px-2 py-1.5  absolute bottom-0 left-0 z-30">
      <SearchBox receiver={guestId} />

      <div className="flex gap-2 ml-auto  ">
        <AddReactionIcon className="text-slate-600 hover:text-orange-500 hover:cursor-pointer text-3xl " />
        <GifBoxIcon className="text-slate-600 hover:text-orange-500 hover:cursor-pointer  text-3xl " />
      </div>
    </div>
  );
};

const SearchBox = ({ receiver }: { receiver: string }) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socket = useSocket();

  const { id } = useRecoilValue(userInfoState);
  // useEffect(() => {

  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = "auto";
  //     console.log(textareaRef.current.scrollHeight);
  //     textareaRef.current.style.height =
  //       textareaRef.current.scrollHeight + "px";
  //   }
  // }, [value]);
  const setMessage = useSetRecoilState(currentMessagesState);
  const handleTextAreaHeight = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setValue(() => event.target.value);
  };
  const sendMessage = () => {
    if (value.trim().length > 0) {
      console.log("emiitng evevnt => message");
      let date = new Date();
      const msg: MessageType = {
        sender: id,
        roomId:generateRoomId(id,receiver),
        recipient: receiver,
        content: value,
        status: "sending",
        timestamp: date.toISOString(),
        id: v4(),
      };

      socket?.emit("newMessage", {
        sender: id,
        receiver,
        roomId: msg.roomId,
        message: value,
        conformationId: msg.id,
      });
       
      setMessage((prev) => [...prev, msg]);
      setValue(() => "");
    }
  };

  return (
    <div className="flex items-start w-full justify-start ">
      <AddCircleIcon className="hover:text-orange-500 text-slate-600 hover:cursor-pointer mt-3 " />
      <div className="w-[75%] md:w-[75%] sm:w-[85%] mt-2 ml-1 mr-2">
        <textarea
          ref={textareaRef}
          className="w-full holder_color m-0  text-xl resize-none outline-none  overflow-hidden bg-inherit text-slate-400"
          rows={1}
          value={value}
          placeholder="write a message"
          onChange={handleTextAreaHeight}
        />
      </div>
      <button
        disabled={!socket}
        className="text-green-600  hover:text-green-700 hover:cursor-pointer mt-3 "
        onClick={sendMessage}
      >
        <SendIcon />
      </button>
    </div>
  );
};
