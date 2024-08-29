"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { guestState } from "@/store/atoms/guest-atom";
import { offerState } from "@/store/atoms/pc-atom";
import { showComponentState } from "@/store/atoms/show-component";
import { connectedUsersState } from "@/store/atoms/socket-atom";
import type { Offer, Candidate, User, ConnectedUsers } from "@/types/types";
import { userInfoState } from "@/store/selectors/user-selector";
import { usePC } from "./peerConnectionContext";
import { usePathname } from "next/navigation";
import type { MessageType } from "@/components/messageView/MessageContainer";
import { MessageNotificationState, NotificationState, type MessageNotificationType } from "@/store/atoms/notificationState";
import { playSound } from "@/utils/DomMutations/domMutations";
import { currentGuestIdFromMessageState } from "@/store/atoms/messages-atom";
import { usePath } from "./pathContext";

const SocketContext = createContext<Socket | null>(null);
export type MessageNotifyType = {
  content: string;
  conversationId: string;
  sender: string;
  roomId: string;
  timestamp: string;
};
export type NotificationType = {
  type: string;
  notifier: {
    id: string;
    name: string;
    profile?: string | null;
  };
  target: { userId: string; mediaId: string };
  createdAt?: string;
};
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const { id, profile, name } = useRecoilValue(userInfoState);

  const setConnectedUsers = useSetRecoilState(connectedUsersState);
  const setShowComponent = useSetRecoilState(showComponentState);
  const setOffer = useSetRecoilState(offerState);
  const setPersontoHandshake = useSetRecoilState(guestState);
  const setNewNotification=useSetRecoilState(NotificationState)

  const path = usePath();
  // console.log(path,"path chnaged")
  const setMessageNotification = useSetRecoilState(MessageNotificationState);

  //message enotify and its dependencies on path chnage
  useEffect(() => {
    if (socketRef.current) {


    socketRef.current.on("notification", (data: NotificationType) => {
      console.log("we are getting notification");
      setNewNotification((prev) => [...prev, data]);
      playSound();
    });




      socketRef.current.on(
        "message_Notify",
        (messageData: MessageNotifyType) => {
          // Handle message notification based on `path`
          console.log("message notify",messageData)
          if (path === `/messages/${messageData.sender}`) return;
        const isuserInmessagesPage=path.startsWith('/messages')
        console.log(isuserInmessagesPage,"is user in mesages ")
          setMessageNotification(
            (prev: MessageNotificationType): MessageNotificationType => {
              const existingConvoIndex = prev.unreadConvos.findIndex(
                (convo) => convo.convoId === messageData.conversationId
              );
              if (existingConvoIndex > -1) {
                const updatedUnreadsForconvoIndex = [
                  ...prev.unreadConvos[existingConvoIndex].unreads,
                  {
                    content: messageData.content,
                    timeStamp: messageData.timestamp,
                  },
                ];
                return {
                  ...prev,
                  unreadConvos: [
                    ...prev.unreadConvos.slice(0, existingConvoIndex),
                    {
                      ...prev.unreadConvos[existingConvoIndex],
                      unreads: updatedUnreadsForconvoIndex,
                      unreadCount: updatedUnreadsForconvoIndex.length,
                    },
                    ...prev.unreadConvos.slice(
                      existingConvoIndex,
                      prev.unreadConvos.length + 1
                    ),
                  ],
                  totalUnreadCount:isuserInmessagesPage? 0 :  prev.totalUnreadCount + 1, // adding one convo in total
                };
              } else {
                return {
                  ...prev,
                  unreadConvos: [
                    ...prev.unreadConvos,
                    {
                      convoId: messageData.conversationId,
                      guestId: messageData.sender,
                      unreadCount: 1,
                      unreads: [
                        {
                          content: messageData.content,
                          timeStamp: messageData.timestamp,
                        },
                      ],
                    },
                  ],
                  totalUnreadCount: isuserInmessagesPage
                    ? 0
                    : prev.totalUnreadCount + 1,
                };
              }
            }
          );
          playSound()
        }
      );

      return () => {
        socketRef.current?.removeListener("message_Notify");
      };
    }
  }, [path,socketRef.current]);

  useEffect(() => {
    if (!socketRef.current && id) {
      const uri =
        process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8080";
      socketRef.current = io(uri, {
        path: "/socket",
        transports: ["websocket"],
      });
      socketRef.current.on("connect", () => {
        console.log("socket connection established");
        socketRef.current?.emit("newUserConnected", { id, name });
        setShowComponent((prev) => ({
          ...prev,
          showWebrtcConnection: !prev.showWebrtcConnection,
        }));
      });

      socketRef.current.on("activeUsers", (activeUsers: ConnectedUsers) => {
        setConnectedUsers((prev) => ({
          ...prev,
          connectedUsers: activeUsers,
        }));
      });

      socketRef.current.on("newUserConnected", (newUserData) => {
        setConnectedUsers(({ connectedUsers }) => ({
          connectedUsers: [...connectedUsers, newUserData],
        }));
      });

      socketRef.current.on("userDisconnected", (disconnectedUserData: User) => {
        setConnectedUsers(({ connectedUsers }) => ({
          connectedUsers: connectedUsers.filter(
            (userInConnection) =>
              userInConnection.id !== disconnectedUserData.id
          ),
        }));
      });

      socketRef.current.on(
        "receivedOfferForRTC",
        ({ user: receivedUser, offer: offerReceived }: Offer) => {
          console.log(
            "Update of persontoHandshake at socket event ",
            receivedUser
          );
          console.log(offerReceived, "Offer from receive offer for RTC");
          setOffer( offerReceived );
          setPersontoHandshake( receivedUser );
          setShowComponent((prev) => ({
            ...prev,
            showCall: true,
          }));
        }
      );



      socketRef.current.on("joinedRoom", (data) => {
        console.log("hey server automatiically kjoined in room ", data);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]); //user id change will trigger socket connection

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): Socket | null => {
  const context = useContext(SocketContext);
  // if (context === null) {
  //   throw new Error("useSocket must be used within a SocketProvider");
  // }
  return context;
};
