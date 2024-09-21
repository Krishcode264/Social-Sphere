"use client";

import { MessageTemplate, type MessageTopBarProps } from "@/app/messages";
import { useSocket } from "@/context/socketContext";
import { userInfoState } from "@/store/selectors/user-selector";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
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
import { ChatAttachmentsState } from "@/store/atoms/ChatAttachmentState";
import useResetAllState from "@/hooks/useResetAllState";
import { usePC } from "@/context/peerConnectionContext";
import { useQuery } from "@tanstack/react-query";
import { CommonFetcher } from "@/utils/fechers/commonFeature";
import Loading from "../basic/loading";
import { debounce } from "lodash";

export type ReplyMessageType = {
  _id: string;
  timestamp: string;
  content: string;
};


  export type FileAttachment={
    url:string,
    type:"photo"| "audio"| "video"|"file"|string,  //lets see after 
    size:number,
    key:string
  }
export type MessageType = {
  _id: string;
  sender: string;
  content: string;
  recipient: string;
  timestamp: string;
  status: string;
  roomId?: string;
  confirmationId?: string;
  repliedTo: string | null;
  attachment?: FileAttachment[];
  conversationId?: string;
  repliedToMessage: ReplyMessageType | null;
};
export interface MessageContainerProps {
  guestId: string;
  messages: MessageType[];
  guestProfile?: string;
  guestName?: string;
}

export const RepliedMessageAttach = ({
  reply,
}: {
  reply: ReplyMessageType | null;
}) => {
  return (
    <div className=" flex items-center justify-start hover:bg-slate-600 hover:cursor-pointer">
      <svg
        width="40"
        height="15"
        viewBox="0 0 25 15"
        className="text-slate-400 mt-3 ml-2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.03054 14C0.549433 4.3488 5.84158 1.3536 10.6526 1.1872C15.4637 1.0208 31.1798 0.965334 40 1.0208"
          stroke="white"
        />
      </svg>
      <div className="ml-1 text-[12px] text-orange-200">
        <p>
          replied to :{" "}
          <span className="text-blue-300"> {reply?.content.slice(0, 20)} </span>
        </p>
      </div>
    </div>
  );
};

export default function MessageContainer({
  messages,
  guestProfile,
  guestId,
  guestName,
}: MessageContainerProps) {
  const socket = useSocket();
  const { id, profile, name } = useRecoilValue(userInfoState);
  const [msgs, setMessages] = useRecoilState(currentMessagesState);
  const updateConvoState = useSetRecoilState(MessageNotificationState);
  const convoStarted = useRef<boolean>(false);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const chatAttach = useRecoilValue(ChatAttachmentsState);
  const ResetChatBoxAttachments = useResetRecoilState(ChatAttachmentsState);
  const [skipLimit, setSkipLimit] = useState({ limit: 20, skip: 0 }); //default one from the prop as messages

  const stableSkipLimit = useMemo(() => ({ ...skipLimit }), [skipLimit]);
  const stableGuestId = useMemo(() => guestId, [guestId]);
  useEffect(() => {
    updateConvoState((prev) => {
      return {
        totalUnreadCount: 0,
        unreadConvos: prev.unreadConvos.filter(
          (convo) => convo.guestId !== guestId
        ),
      };
    });
  }, []);

  const {
    isPending,
    error,
    data: newMessages,
    isFetching,
    isSuccess: fetchingSuccess,
    refetch,
  } = useQuery({
    queryKey: ["messages", skipLimit,guestId],
    queryFn: async () =>
      await CommonFetcher("message/getMessageHistory", {
        ...stableSkipLimit,
        guestId: stableGuestId,
      }),
  });

  useEffect(() => {
    if (newMessages?.messages) {
      setMessages((prev) => {
        return [...newMessages.messages, ...prev];
      });
    }
    // console.log(
    //   newMessages?.messages,
    //   "new fetched messages ",
    //   stableSkipLimit
    // );
  }, [newMessages]);

  useEffect(() => {
    return () => {
      setMessages([]);
    };
  }, [guestId]);

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
            console.log(id, newMsg, "new message id ");
            if (id === newMsg.sender) {
              //message si mine
              const beforeMsgIndex = prev.findIndex(
                (m) => m._id === newMsg.confirmationId
              ); //finding msg to confirm chnages
              if (beforeMsgIndex !== -1) {
                //update beforesmg.id to newmsg.id and returen new messagearfray with updated id of that perticular message
                console.log("updating message now ...");
                const updatedMessages = [...prev];
                updatedMessages[beforeMsgIndex] = {
                  ...updatedMessages[beforeMsgIndex],
                  _id: newMsg._id,
                  status: "sent",
                };
                return updatedMessages;
              }
            } else {
              if (!prev.find((m) => m._id === newMsg._id)) {
                playSound();
                console.log("sound")
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
 

    ResetChatBoxAttachments();
  }, []);

  useEffect(() => {
    if(skipLimit.skip===0){
  handleScrollDown(messageContainerRef.current);
    }
  
  }, [messageContainerRef, chatAttach,msgs]);
  useEffect(() => {
    // Refetch messages when stableSkipLimit or stableGuestId changes
    refetch();
  }, [skipLimit, guestId]);

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (
        messageContainerRef.current?.scrollTop === 0 &&
        !isFetching &&
        !isPending
      ) {
        setSkipLimit((prev) => ({ ...prev, skip: prev.skip + 20 }));
      }
    }, 400); // Debounce the scroll event by 400ms 

    const container = messageContainerRef.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [isFetching, isPending, refetch, messageContainerRef, skipLimit]);

  const renderMessages = () => {

    return msgs.map((m: MessageType) => {
      return (
        <div className="hover:bg-slate-00  " key={m._id}>
          {m.repliedTo && <RepliedMessageAttach reply={m.repliedToMessage} />}

          <MessageTemplate
            m={m}
            key={m._id}
            status={m.status}
            name={m.sender === id ? name : guestName}
            profile={m.sender === id ? profile || i2 : guestProfile || i2}
          />
        </div>
      );
    });
  };

  return (
    <div
      ref={messageContainerRef}
      className="h-full  overflow-y-scroll overflow-x-hidden"
    >
      {/* {isFetching && <Loading/>} */}
      {renderMessages()}
    </div>
  );
}

export const AudioVideoCallButton = ({
  state,
  id,
  profile,
  name,
}: {
  state: "audio" | "video";
  id: string;
  profile: string;
  name: string;
}) => {
  const setShowCompennts = useSetRecoilState(showComponentState);
  const setMode = useSetRecoilState(CallWindowAtomState);
  const setPersonToHandshake = useSetRecoilState(guestState);
  const [call, setCall] = useRecoilState(callState);

  const activateCallWindow = () => {
    if (call.status === "default") {
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
