import type { MessageType } from "@/components/messageView/MessageContainer";
import { atom } from "recoil";

export const currentMessagesState = atom<MessageType[] | []>({
  key: "notification state",
  default: [],
});
