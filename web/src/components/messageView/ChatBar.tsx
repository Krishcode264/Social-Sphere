"use client";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useEffect, useRef, useState } from "react";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import GifBoxIcon from "@mui/icons-material/GifBox";
import SendIcon from "@mui/icons-material/Send";
import { useSocket } from "@/context/socketContext";
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import { userInfoState } from "@/store/selectors/user-selector";
import {
  conversationIdSelector,
  currentMessagesState,
} from "@/store/atoms/messages-atom";
import type { MessageType } from "./MessageContainer";
import { randomUUID } from "crypto";
import { v4 } from "uuid";
import { generateRoomId } from "@/utils/helpers/helper";
import { ChatAttachmentsState } from "@/store/atoms/ChatAttachmentState";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import { size, startsWith } from "lodash";
import Image from "next/image";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";
import { handleFileUploadToS3 } from "./functions";
import { RotateRight } from "@mui/icons-material";
export type ChatBarProps = {
  guestId: string;
};

export const ChatBarAttachments = () => {
  const [chatAttach, setChatAttach] = useRecoilState(ChatAttachmentsState);

  useEffect(() => {
    console.log(chatAttach, "chat attach updated ");
  }, [chatAttach]);
  const AttachmentView = () => {
    const getBlobUrl = (file: any) => {
      const blobUrl = URL.createObjectURL(file);
      return blobUrl;
    };

    return (
      <div className="  w-[100%] h-full  gap-2  flex flex-wrap ">
        {chatAttach.media.map((media) => {
          return (
            <div className=" relative rounded-md w-[180px] h-[140px]" key={media.src.name}>
              <button className="absolute right-0 bg-slate-700 px-2 rounded-md">
                <Tooltip title="remove item">
                  <DeleteIcon
                    className="text-orange-600 hover:text-orange-800"
                    onClick={() => {
                      setChatAttach((prev) => {
                        return {
                          ...prev,
                          media: prev.media.filter(
                            (m) => m.src.name !== media.src.name
                          ),
                        };
                      });
                    }}
                  />
                </Tooltip>
              </button>
              <div className="absolute bottom-0 text-orange-200 text-[12px] bg-slate-700 w-full rounded-sm">
                <p>{media.src.name.slice(0, 24)}...</p>
              </div>
              {media.type === "image" && (
                <Image
                  className=" rounded-md w-full h-full"
                  src={getBlobUrl(media.src)}
                  alt="attach"
                  width={5}
                  height={5}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="  rounded-sm w-full bg-slate-800">
      {chatAttach.replying.name && (
        <div className="border border-blue-500 rounded-sm ">
          <span className="flex justify-between items-center">
            <h4 className="text-orange-200 px-1 py-1.5">
              replying to {chatAttach.replying.name}
            </h4>
            <HighlightOffRoundedIcon
              className="text-orange-300 hover:cursor-pointer"
              onClick={() => {
                setChatAttach((prev) => ({
                  ...prev,
                  replying: { name: "", mId: "", content: "", timestamp: "" },
                }));
              }}
            />
          </span>
        </div>
      )}

      {chatAttach.media.length > 0 && <AttachmentView />}
    </div>
  );
};

export const ChatBar = ({ guestId }: ChatBarProps) => {
  const [chatAttach, setChatAttach] = useRecoilState(ChatAttachmentsState);
  return (
    <div className="bg-slate-800    rounded-md  gap-2 shadow-sm  mr-auto w-full flex-col items-center px-2 py-1.5  ">
      {chatAttach.replying.mId || chatAttach.media.length > 0 ? (
        <ChatBarAttachments />
      ) : null}

      <div className="flex mt-2 w-full">
        <SearchBox receiver={guestId} />

        <div className="flex gap-2 ml-auto items-center ">
          <AddReactionIcon className="text-slate-600 hover:text-orange-500 hover:cursor-pointer text-3xl " />
          <GifBoxIcon className="text-slate-600 hover:text-orange-500 hover:cursor-pointer  text-3xl " />
        </div>
      </div>
    </div>
  );
};

//wrong name it isnt search box ahahah
const SearchBox = ({ receiver }: { receiver: string }) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socket = useSocket();
  const [chatAttach, setChatAttach] = useRecoilState(ChatAttachmentsState);
  const ResetChatBoxAttachments = useResetRecoilState(ChatAttachmentsState);
  const { id } = useRecoilValue(userInfoState);
  const conversationId = useRecoilValue(conversationIdSelector);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      console.log(textareaRef.current.scrollHeight);
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);
  const setMessage = useSetRecoilState(currentMessagesState);
  const handleTextAreaHeight = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setValue(() => event.target.value);
  };

  const sendMessage = async () => {

    if (value.trim().length > 0 || chatAttach.media.length > 0) {
      console.log("emiitng evevnt => message");
      setSending(true)
      let files: { key: string; url: string; size: number, type: string, urlExpirationTime?: string }[] | null = null;

      if (chatAttach.media.length > 0 && conversationId) {
        const uploadedFiles = await handleFileUploadToS3(
          chatAttach.media,
          conversationId
        );
        if (uploadedFiles) {

          console.log("uploaded files", uploadedFiles)
          const newMedia = chatAttach.media
            .map((m) => {
              const matched = uploadedFiles.find((d) => d.name === m.src.name);
              if (matched) {
                return {
                  key: matched.key,
                  url: matched.url,
                  size: Number(m.src.size),
                  type: m.src.type,
                  urlExpirationTime: matched.urlExpirationTime
                };
              }
              return undefined;
            })
            .filter(
              (media): media is { key: string; url: string; size: number, type: string, urlExpirationTime: string } =>
                media !== undefined // Filter out undefined values
            );
          console.log("new media after being sanitized ", newMedia)
          files = newMedia.length > 0 ? newMedia : null;

        } else {
          return; //error have to manage it well
        }
      }
      let date = new Date();
      const { content, mId, timestamp, name } = chatAttach.replying;

      const msg: MessageType = {
        sender: id,
        roomId: generateRoomId(id, receiver),
        recipient: receiver,
        content: value,
        status: "sending",
        timestamp: date.toISOString(),
        _id: v4(),
        attachment: files ?? undefined,
        repliedTo: chatAttach.replying.mId ? chatAttach.replying.mId : null,
        repliedToMessage: chatAttach.replying.mId
          ? { _id: mId, content, timestamp }
          : null,
      };

      socket?.emit("newMessage", {
        sender: id,
        receiver,
        roomId: msg.roomId,
        message: value,
        repliedTo: chatAttach.replying.mId ? chatAttach.replying.mId : null,
        conformationId: msg._id,
        attachment: files ?? undefined,
        repliedToMessage: chatAttach.replying.mId
          ? { _id: mId, content, timestamp }
          : null,
      });

      setMessage((prev) => [...prev, msg]);
      setValue(() => "");
      ResetChatBoxAttachments();
      setSending(false);
    }
  };
  const attachFileRef = useRef<HTMLInputElement | null>(null);
  const handleAttachFileClick = () => {
    attachFileRef.current?.click();
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: any = e.target.files;
    if (files[0]) {
      setChatAttach((prev) => {
        console.log(files[0]);
        if (files[0].type.startsWith("image")) {
          console.log("setting up media o chatatatch state ");
          return {
            ...prev,
            media: [
              { type: "image", src: files[0], isAttachment: true },
              ...prev.media,
            ],
          };
        }
        if (files[0].type.startsWith("video")) {
          return {
            ...prev,
            isAttachment: true,
            media: [{ type: "video", src: files[0] }, ...prev.media],
          };
        }
        return prev;
      });
    }
  };

  return (
    <div className="flex items-start w-full justify-start  ">
      <input
        onChange={handleAttachmentChange}
        type="file"
        name=""
        id=""
        className="hidden "
        ref={attachFileRef}
      />
      <AddCircleIcon
        className="hover:text-orange-500 text-slate-600 hover:cursor-pointer mt-3 "
        onClick={handleAttachFileClick}
      />
      <div className="w-[75%] md:w-[75%] sm:w-[85%] mt-2 ml-1 mr-2">
        <textarea
          ref={textareaRef}
          className="w-full holder_color m-0   text-xl resize-none outline-none  overflow-hidden bg-inherit text-slate-400"
          rows={1}
          autoFocus={true}
          value={value}
          placeholder="write a message"
          onChange={handleTextAreaHeight}
        />
      </div>
      <button
        disabled={!socket || sending}
        style={{ color: socket ? "" : "green" }}
        className="text-green-600  hover:text-green-400 hover:cursor-pointer mt-3 "
        onClick={sendMessage}
      >

        {sending ? <RotateRight /> : <SendIcon />}

      </button>
    </div>
  );
};
