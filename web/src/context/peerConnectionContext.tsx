"use client";
import { userInfoState } from "@/store/selectors/user-selector";
import type { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { io } from "socket.io-client";
import { Provider } from "react";

const PcContext = createContext<RTCPeerConnection | null>(null);

export const PcProvider = ({ children }: { children: React.ReactNode }) => {
    const configForPeerconnection = {
      echoCancellation: true,
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    };

    const [peerConnection] = useState<RTCPeerConnection | null>(() => {
      if (typeof window !== "undefined") {
        return new RTCPeerConnection(configForPeerconnection);
      }
      return null;
    });
  
  

  return (
    <PcContext.Provider value={peerConnection}>{children}</PcContext.Provider>
  );
};

export const usePC = (): RTCPeerConnection | null => {
  const pc = useContext<RTCPeerConnection | null>(PcContext);
  if (pc === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return pc;
};
