"use client";
import Loading from "@/components/basic/loading";
import MessageContainer, {
  type FileAttachment,
  type MessageType,
} from "@/components/messageView/MessageContainer";
import ProfilePic from "@/components/profile/profile_photo";
import p1 from "@/images/duf.webp";
import { fetchMessageHistory, getUserConvos } from "@/utils/fechers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image, { type StaticImageData } from "next/image";
import i2 from "@/images/duf.webp";
import { cache, Suspense, useState } from "react";
import getTimeString from "@/utils/helpers/times";
import type { ConvoType } from "@/types/types";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRecoilState, useRecoilValue } from "recoil";

import { userInfoState } from "@/store/selectors/user-selector";
import ReplyAllRoundedIcon from "@mui/icons-material/ReplyAllRounded";
import { Tooltip } from "@mui/material";
import { ChatAttachmentsState } from "@/store/atoms/ChatAttachmentState";
import { showMsgMediaLargeView } from "@/store/atoms/show-component";
import DomPortal from "@/components/customs/DomPortal";
// export const ChatHead:React.FC<ChatHeadProps> = ({convo}) => {
//   const {lastMsg,count}= useRecoilValue(newMessagesCountSelector(convo.guestId));
//   return (
//     <Link
//       href={`${process.env.BASE_URL}/messages/${convo.guestId}`}
//       className="flex  items-center justify-center gap-3  hover:bg-slate-700 hover:cursor-pointer md:p-1.5  bg:rounded-md rounded-lg md:justify-start min-w-12 h-12  w-full  bg-slate-900 "
//     >
//       <Image
//         src={convo.guestProfile || i2}
//         width={30}
//         height={30}
//         unoptimized={true}
//         alt="user"
//         className="rounded-full"
//       ></Image>

//       <p className="text-xl font-semibold hidden md:block text-slate-400 text-[16px] sm:text-[14px]">
//         {convo.guestName}
//       </p>
//       {count>0 && <Badge badgeContent={count} color="primary"/>}
//       <p className="text-xl font-semibold hidden md:block text-slate-400 text-[16px] sm:text-[14px]">
//         {lastMsg}
//       </p>
//     </Link>
//   );
// };

//mid can not be present because it comes after message conformation , it can lead to bug fix : only showing hover options if sent is confirmed
export const MessageHoverOptions = ({
  name,
  mId,
  content,
  timestamp,
}: {
  name: string;
  mId: string;
  content: string;
  timestamp: string;
}) => {
  const [chatAttach, setChatAttach] = useRecoilState(ChatAttachmentsState);
  // console.log(mId,name,"mid iand name ")
  const handleReplyStateUpdate = () => {
    setChatAttach((prev) => ({
      ...prev,
      isAttachment: true,
      replying: { name, mId, content, timestamp },
    }));
  };
  return (
    <div className=" text-slate-300 hidden  group-hover:flex absolute top-0 right-0">
      <Tooltip title={`reply to ${name}`}>
        <ReplyAllRoundedIcon
          className="hover:text-orange-500"
          onClick={handleReplyStateUpdate}
        />
      </Tooltip>
    </div>
  );
};
export const MessageMedia = ({
  attachments,
}: {
  attachments: FileAttachment[];
}) => {
  //const [msgMediaView,setmsgmediaView] = useRecoilState(showMsgMediaLargeView);
  // console.log("got message attachemnt", attachments);




  const ImageItem = ({ src }: { src: FileAttachment }) => {
    const [largeView, setLargeView] = useState(false);
    const onClose = () => {
      setLargeView((prev) => !prev);
    };
    if (largeView) {
      return (
        <DomPortal onClose={onClose} component={<ImageItem src={src} />} />
      );
    }
    return (
      <div
        className={`${
          largeView ? "FullMessageMediaView" : ""
        } w-[70%] h-[90%] hover:cursor-pointer `}
        onClick={() => {
          if (!largeView) setLargeView((prev) => !prev);
        }}
      >
        <Image
          src={src.url}
        
          alt={src.key.split("/")[2].slice(0, 10)}
          width={30}
          height={30}
          className=" w-full h-full     "
          unoptimized={true}
        />
      </div>
    );
  };

  const VideoItem = ({ src }: { src: FileAttachment }) => {
    const [largeView, setLargeView] = useState(false);
    const onClose = () => {
      setLargeView((prev) => !prev);
    };
    if (largeView) {
      return (
        <DomPortal onClose={onClose} component={<VideoItem src={src} />} />
      );
    }
    return (
      <div
        className={`${
          largeView ? "FullMessageMediaView" : ""
        } w-[80%]  hover:cursor-pointer `}
        onClick={() => {
          if (!largeView) setLargeView((prev) => !prev);
        }}
      >
        <video
          height={30}
          className=" w-full h-full "
          src={src.url}
          controls
          preload="metadata"
        ></video>
      </div>
    );
  };
  const AudioItem = ({ src }: { src: FileAttachment }) => {
    return (
      <div>
        <audio src={src.url}></audio>
      </div>
    );
  };
  const DefaultItem = ({ src }: { src: FileAttachment }) => {
    return (
      <div>
        <Link href={src.url}> open file</Link>
      </div>
    );
  };

  return attachments.map((a: FileAttachment) => {
    if (a.type.startsWith("image")) {
      return <ImageItem src={a} key={a.key} />;
    }
    if (a.type.startsWith("video")) {
      return <VideoItem src={a} key={a.key} />;
    }
    if (a.type.startsWith("audio")) {
      return <AudioItem src={a}  key={a.key}/>;
    } else return <DefaultItem src={a} key={a.key}/>;
  });
};

export const MessageTemplate = ({
  m,
  profile,
  name,
  status,
}: {
  m: MessageType;
  profile: string | StaticImageData;
  name?: string;
  status: string;
}) => {
  const { id } = useRecoilValue(userInfoState);

  return (
    <div
      style={{ opacity: status === "sending" ? "0.5" : "" }}
      className="flex group  gap-3  hover:bg-slate-800   p-2 rounded-md items- justify-start min-w-24  relative"
    >
      {status === "sent" && (
        <MessageHoverOptions
          name={name || ""}
          mId={m._id}
          content={m.content}
          timestamp={m.timestamp}
        />
      )}
      <Image
        src={profile}
        width={30}
        height={30}
        unoptimized={true}
        alt="user"
        className="rounded-full h-6 w-6 "
      ></Image>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col ">
          <div className="flex gap-3 flex-row">
            <p className="  text-slate-500 font-semibold hover:text-slate-300 text-[16px] sm:text-[14px]">
              {name?.slice(0, 15)}
            </p>
            <span className="text-slate-600 text-[15px]">
              {getTimeString(m.timestamp, "en-IN")}
            </span>
            {/* {m.recipient !== id && (
            <span
              className=" text-[13px] "
              style={{ color: `${status === "sent" ? "green" : "orange"}` }}
            >
              {status}
            </span>
          )} */}
          </div>
          <p className="message-template-content text-slate-300  text-[16px] sm:text-[14px] ">
            {m.content}
          </p>
        </div>

        {m.attachment && m.attachment.length > 0 && (
          <div className="flex gap-2 flex-col">
            <MessageMedia attachments={m.attachment} />
          </div>
        )}
      </div>
    </div>
  );
};

export type MessageTopBarProps = {
  name: string;
  profile: string;
  id: string;
};

export type MessageHistoryResponse = {
  guestInfo: MessageTopBarProps;
  messages: MessageType[];
};
