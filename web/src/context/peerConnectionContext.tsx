"use client";
import { userInfoState } from "@/store/selectors/user-selector";
import { Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { io } from "socket.io-client";
import { Provider } from "react";
import { useSocket } from "./socketContext";
import type { Candidate, Offer, OfferType } from "@/types/types";
import { guestState } from "@/store/atoms/guest-atom";
import { callState } from "@/store/atoms/calling-state";
import { offerState } from "@/store/atoms/pc-atom";
import { showComponentState } from "@/store/atoms/show-component";
import { mediaState } from "@/store/selectors/media-state-selector";
import { mediaStreamState, remoteStreamState } from "@/store/atoms/media-stream-atom";

export type PCContextType = {
  PC: RTCPeerConnection | null;
  createOffer: () => Promise<RTCSessionDescriptionInit | undefined>;
  createAnswer: () => void;
};
const PcContext = createContext<PCContextType | null>(null);

export const PcProvider = ({ children }: { children: React.ReactNode }) => {
  const configForPeerconnection = {
    echoCancellation: true,
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
  };
  const [guest, setGuest] = useRecoilState(guestState);
  const offerer = useRecoilValue(userInfoState);
  const socket = useSocket();
  const [callStates, setCallState] = useRecoilState(callState);
  const setShowComponent = useSetRecoilState(showComponentState);
  const [offer, setOffer] = useRecoilState(offerState);
  const setStream = useSetRecoilState(remoteStreamState);
  const iceCandidateBuffer: RTCIceCandidate[] = [];

  const [PC] = useState<RTCPeerConnection | null>(() => {
    if (typeof window !== "undefined") {
      return new RTCPeerConnection(configForPeerconnection);
    }
    return null;
  });

  const createOffer = async (): Promise<
    RTCSessionDescriptionInit | undefined
  > => {
    try {
      const createdOffer = await PC?.createOffer();
      await PC?.setLocalDescription(createdOffer);
      socket?.emit("offer", { offer: createdOffer, guest, offerer });
      console.log("emitting ofeer ");
      return createdOffer;
    } catch (error) {
      console.error("Error creating offer:", error);
      return undefined;
    }
  };

  const createAnswer = async () => {
    if (offer) {
      await PC?.setRemoteDescription(offer);
      const createdAnswer = await PC?.createAnswer();
      if (createdAnswer) {
        await PC?.setLocalDescription(createdAnswer);
        socket?.emit("answer", {
          answer: createdAnswer,
          guest,
          offerer,
        });
        setCallState(() => ({ status: "calling", action: "receiver" }));
      }
    }
  };

  useEffect(() => {
    if (PC && socket) {
      PC.onicecandidate = (event) => {
        if (event.candidate) {
          iceCandidateBuffer.push(event.candidate);
        }
      };

      PC.ontrack = (e: RTCTrackEvent) => {
        console.log("getting remote streams e.streams ", e.streams);
       console.log("tracks on remote stream",e.streams[0].getTracks())
        const kind = e.streams[0].getTracks()[0].kind;
      if(e.streams && e.streams[0]){
         const kind = e.streams[0].getTracks()[0].kind;

  if (kind === "audio") {
    console.log("setting up audio remote stream");
    setStream((prev) => ({ ...prev, audio: e.streams[0] }));
  }
  if(kind==="video"){
      console.log("setting up video remote stream");
      setStream((prev) => ({ ...prev, video: e.streams[0] }));
  }
    if (kind === "screen") {
      console.log("setting up screen  remote stream");
      setStream((prev) => ({ ...prev, screen: e.streams[0] }));
    }

      }
      
      };
    
 
      const emitcandidates = () => {
        console.log("sending ice candidate from guest ");
        socket?.emit("guest-candidate", { iceCandidateBuffer, guest, offerer });
      };

      socket.on(
        "guest-candidate",
        async ({ iceCandidateBuffer }: Candidate) => {
          iceCandidateBuffer.forEach(async (candidate) => {
            await PC.addIceCandidate(candidate);
          });
          console.log("adding ice candidate from guest ");
        }
      );

      socket.on("candidate", async ({ iceCandidateBuffer }: Candidate) => {
        console.log("Getting ICE candidate from guest");

        if (PC.remoteDescription) {
          iceCandidateBuffer.forEach(async (candidate) => {
            await PC.addIceCandidate(candidate);
          });
          console.log("adding ice candidate from offerer");
          emitcandidates();
        }
      });

      socket?.on("answer", async (data) => {
        //   console.log("getting answer", guest,data);

        if (guest.id === data.offerer.id) {
          console.log("getting answer");
          await PC?.setRemoteDescription(data.answer);
          console.log(iceCandidateBuffer, "ice candifdate buffer ");
          console.log(guest, offerer, "we are in anser ");
          //  PC?.restartIce();
          socket.emit("candidate", { iceCandidateBuffer, guest, offerer });
          iceCandidateBuffer.length = 0; 
        }
      });

      socket?.on("offer", async (data) => {
        console.log("getting ofeer ");
        if (
          callStates.status === "calling" ||
          callStates.status === "incall" ||
          PC?.remoteDescription ||
          guest.id
        ) {
          console.log("user is busy ");
          socket.emit("busy", data);
        }
        console.log("offer", data.offerer);
        setOffer(data.offer);
        setGuest(data.offerer);
        setShowComponent((prev) => ({
          ...prev,
          showCall: true,
        }));
      });
    }
  }, [PC, socket, guest]);

  return (
    <PcContext.Provider value={{ PC, createOffer, createAnswer }}>
      {children}
    </PcContext.Provider>
  );
};

export const usePC = (): PCContextType => {
  const pc = useContext(PcContext);
  if (!pc) {
    console.log("come on client side it will be null on server pc ");
    throw Error;
  }
  return pc;
};
