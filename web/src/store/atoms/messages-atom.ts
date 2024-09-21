import type { MessageType } from "@/components/messageView/MessageContainer";
import { atom, selector } from "recoil";

export type CurrentMessagesStateType={
  guestId:string,
  messages:MessageType[]|[]
}
export const currentMessagesState = atom<MessageType[] | []>({
  key: "current-message-state",
  default: []
});


export const currentGuestIdFromMessageState=selector({
key:"current-guestid-selector",
get:({get})=> {
  const messages= get(currentMessagesState)
  const currentGuestId=messages.length>0 ? messages[0].sender : ""
  return currentGuestId}
})

export const conversationIdSelector=selector({
  key:"convoid selector",
  get:({get})=>{
    const msg = get(currentMessagesState)[0];
    return msg?.conversationId
  }
})