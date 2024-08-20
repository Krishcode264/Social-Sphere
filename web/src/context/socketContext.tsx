"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import type { ConnectedUsers } from "@/components/webRTC/meet/meet";
import { guestState } from "@/store/atoms/guest-atom";
import { offerState } from "@/store/atoms/pc-atom";
import { showComponentState } from "@/store/atoms/show-component";
import { connectedUsersState } from "@/store/atoms/socket-atom";
import type { Offer, Candidate, User } from "@/types/types";
import { userInfoState } from "@/store/selectors/user-selector";
import { usePC } from "./peerConnectionContext";
import { usePathname } from "next/navigation";
import type { MessageType } from "@/components/messageView/MessageContainer";
import { MessageNotificationState } from "@/store/atoms/notificationState";
import { playSound } from "@/utils/DomMutations/domMutations";
import { currentGuestIdFromMessageState } from "@/store/atoms/messages-atom";
import { usePath } from "./pathContext";

const SocketContext = createContext<Socket | null>(null);
export type MessageNotifyType = {
  content:string,
  conversationId:string,
  sender:string,
  roomId:string
};
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const { id, profile, name } = useRecoilValue(userInfoState);

  const setConnectedUsers = useSetRecoilState(connectedUsersState);
  const setShowComponent = useSetRecoilState(showComponentState);
  const setOffer = useSetRecoilState(offerState);
  const setPersontoHandshake = useSetRecoilState(guestState);
  const peerConnection = usePC();
const path = usePath()
const currentPathRef = useRef(path);
  const setMessageNotification=useSetRecoilState(MessageNotificationState)


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
        socketRef.current?.emit("newUserConnected", {id,name});
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
          setOffer({ offer: offerReceived });
          setPersontoHandshake({ persontoHandshake: receivedUser });
          setShowComponent((prev) => ({
            ...prev,
            showCall: true,
          }));
        }
      );

      socketRef.current.on("receivedAnswerToRTC", async ({ answer }: Offer) => {
        if (peerConnection?.remoteDescription) {
          return;
        }
        await peerConnection?.setRemoteDescription(answer);
      });

      socketRef.current.on("candidate", async ({ candidate }: Candidate) => {
        console.log("Getting ICE candidate from guest");
        if (peerConnection?.remoteDescription) {
          try {
            await peerConnection.addIceCandidate(candidate);
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      });


      socketRef.current.on("joinedRoom",(data)=>{
       
       console.log("hey server automatiically kjoined in room ",data)
      })
     
      socketRef.current.on("message_Notify", (messageData: MessageNotifyType) => {
        console.log(
          "currentref.current ",
          currentPathRef.current,
          "sender path  ",
          `messages/${messageData.sender}`
        );
        
        if (currentPathRef.current === `/messages/${messageData.sender}`) return;
   
        setMessageNotification((prev) => [
          ...prev,
          {
            roomId:messageData.roomId,
            guestId: messageData.sender,
            convoId: messageData.conversationId,
            content: messageData.content,
          },
        ]);
        console.log(
          "updating notification",
          "user is on this path",
          currentPathRef.current,
          messageData.content
        );
        playSound.play();
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
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
