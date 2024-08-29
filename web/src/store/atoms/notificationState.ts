
import type { NotificationType } from "@/context/socketContext";
import { atom, selector, selectorFamily, useRecoilState, useSetRecoilState } from "recoil";

export type UnreadMessageType={
content:string;
timeStamp:string;
}
export type UnreadConvoType={
unreadCount:number
guestId:string
convoId:string
unreads:UnreadMessageType[]|[]
}
export type MessageNotificationType = {
  totalUnreadCount: number;
  unreadConvos: UnreadConvoType[] | [];
};

export const MessageNotificationState = atom<MessageNotificationType>({
  key: "message-notification-state",
  default: {
    totalUnreadCount:0,
    unreadConvos:[]
  },
});

export const TotalUnreadMessageCountSelector=selector({
  key:"message-count",
  get:({get})=> get(MessageNotificationState).totalUnreadCount,
  
})

export const UnViwedConvoSelector = selectorFamily({
  key: "newMessagesCountSelector",
  get:
    (guestId) =>
    ({ get }) => {
      const convo= get(MessageNotificationState).unreadConvos.find((convo) => convo.guestId === guestId)
      if(convo){
 const lastMsg = convo?.unreads.length > 0 ? convo.unreads[convo?.unreads.length-1].content: "";
       return { count:convo.unreadCount, lastMsg };
      }
     return {count:0,lastMsg:''}

    },
});




export const NotificationState = atom<NotificationType[]|[]>({
  key: "system-notification",
  default: [],
});