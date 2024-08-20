
import { atom, selector, selectorFamily } from "recoil";

export type MessageNotificationType={
  guestId:string;
  convoId:string;
  content:string;
}

export const MessageNotificationState = atom<MessageNotificationType[]|[]>({
  key: "message-notification-state",
  default: [],
});

export const unreadMessageCount=selector({
  key:"message-count",
  get:({get})=> get(MessageNotificationState).length,
  
})

export const newMessagesCountSelector = selectorFamily({
  key: "newMessagesCountSelector",
  get:
    (guestId) =>
    ({ get }) => {
      const messages = get(MessageNotificationState).filter((message) => message.guestId === guestId)
      const lastMsg=messages.length>0 ? messages[messages.length-1].content : ""
      return {count:messages.length,lastMsg}
    },
});