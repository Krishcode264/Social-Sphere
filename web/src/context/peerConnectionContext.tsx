"use client";
import { userInfoState } from "@/store/selectors/user-selector";
import { toast } from "sonner";
import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useSocket } from "./socketContext";
import type { Candidate } from "@/types/types";
import { guestState } from "@/store/atoms/guest-atom";
import { callState } from "@/store/atoms/calling-state";
import { offerState } from "@/store/atoms/pc-atom";
import { showComponentState } from "@/store/atoms/show-component";
import { mediaStreamState, remoteStreamState } from "@/store/atoms/media-stream-atom";

export type PCContextType = {
  PC: RTCPeerConnection | null;
  createOffer: () => Promise<RTCSessionDescriptionInit | undefined>;
  createAnswer: () => void;
  createPeerConnection: () => RTCPeerConnection;
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

  const [PC, setPeerConnection] = useState<RTCPeerConnection | null>(() => {
    if (typeof window !== "undefined") {
      return new RTCPeerConnection(configForPeerconnection);
    }
    return null;
  });

  const createPeerConnection = () => {
    const newPeerConnection = new RTCPeerConnection(configForPeerconnection);
    setPeerConnection(newPeerConnection);
    return newPeerConnection;
  };

  const createOffer = async (): Promise<RTCSessionDescriptionInit | undefined> => {
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
      PC.onnegotiationneeded = async () => {
        try {
          console.log("Renegotiation needed - creating new offer");
          await createOffer();
        } catch (err) {
          console.error("Renegotiation failed:", err);
        }
      };

      PC.onicecandidate = (event) => {
        if (event.candidate) {
          iceCandidateBuffer.push(event.candidate);
        }
      };

      PC.ontrack = (e: RTCTrackEvent) => {
        console.log("getting remote streams e.streams ", e.streams);
        if (e.streams && e.streams[0]) {
          console.log("tracks on remote stream", e.streams[0].getTracks());
          const kind = e.streams[0].getTracks()[0].kind;

          if (kind === "audio") {
            console.log("setting up audio remote stream");
            setStream((prev) => ({ ...prev, audio: e.streams[0] }));
          }
          if (kind === "video") {
            console.log("setting up video remote stream");
            setStream((prev) => ({ ...prev, video: e.streams[0] }));
          }
          if (kind === "screen") {
            console.log("setting up screen remote stream");
            setStream((prev) => ({ ...prev, screen: e.streams[0] }));
          }
        }
      };

      const emitcandidates = () => {
        console.log("sending ice candidate from guest ");
        socket?.emit("guest-candidate", { iceCandidateBuffer, guest, offerer });
      };

      const handleGuestCandidate = async ({ iceCandidateBuffer: receivedCandidates }: Candidate) => {
        receivedCandidates.forEach(async (candidate) => {
          await PC.addIceCandidate(candidate);
        });
        console.log("adding ice candidate from guest ");
      };

      const handleCandidate = async ({ iceCandidateBuffer: receivedCandidates }: Candidate) => {
        console.log("Getting ICE candidate from guest");
        if (PC.remoteDescription) {
          receivedCandidates.forEach(async (candidate) => {
            await PC.addIceCandidate(candidate);
          });
          console.log("adding ice candidate from offerer");
          emitcandidates();
        }
      };

      const handleAnswer = async (data: any) => {
        if (guest.id === data.offerer.id) {
          console.log("getting answer");
          await PC?.setRemoteDescription(data.answer);
          console.log(iceCandidateBuffer, "ice candifdate buffer ");
          socket.emit("candidate", { iceCandidateBuffer, guest, offerer });
          iceCandidateBuffer.length = 0;
        }
      };

      const handleOffer = async (data: any) => {
        console.log("getting offer ");
        const isRenegotiation = guest.id === data.offerer.id;

        if (isRenegotiation) {
          console.log("Renegotiation offer from current guest - auto-answering");
          try {
            // Handle conflicting offers (glare) if necessary, but skipping for simplicity now
            await PC.setRemoteDescription(data.offer);
            const answer = await PC.createAnswer();
            await PC.setLocalDescription(answer);
            socket.emit("answer", {
              answer,
              guest: data.offerer,
              offerer: offerer // I am the responder (offerer in the answer payload context depends on backend naming, usually 'offerer' key in answer packet means 'who sent the answer' or 'who sent the original offer'? 
              // Looking at backend: socket.on("answer", ({ answer, guest, offerer }))
              // Backend relays to guest.id (which is the original offerer).
              // The client 'createAnswer' function uses: socket.emit("answer", { answer, guest, offerer }) where guest is the original offerer.
              // So here: guest is data.offerer. offerer is ME.
            });
          } catch (err) {
            console.error("Error handling renegotiation offer:", err);
          }
          return;
        }

        if (
          callStates.status === "calling" ||
          callStates.status === "incall" ||
          PC?.remoteDescription ||
          guest.id
        ) {
          console.log("user is busy ");
          socket.emit("busy", data);
          return; // Stop processing if busy
        }
        console.log("offer", data.offerer);
        setOffer(data.offer);
        setGuest(data.offerer);
        setShowComponent((prev) => ({
          ...prev,
          showCall: true,
        }));
      };

      const handleUserBusy = ({ guest: busyGuest }: { guest: any }) => {
        console.log("User is busy:", busyGuest?.name);
        toast(`${busyGuest?.name || "User"} is busy with another call.`, {
          style: { background: "orange", color: "white", fontWeight: 700 }
        });
        // User requested to keep the window open even if busy
        // setCallState({ status: "default", action: "default" });
        // setGuest({ id: "", name: "" });
        // setShowComponent((prev) => ({ ...prev, showCall: false, showCallWindow: false }));
      };

      const handleCallEnded = ({ by }: { by: any }) => {
        console.log("Call ended by:", by?.name);
        toast(`${by?.name || "User"} ended the call.`, {
          style: { background: "red", color: "white", fontWeight: 700 }
        });
        setCallState({ status: "default", action: "default" });
        setGuest({ id: "", name: "" });
        setShowComponent((prev) => ({ ...prev, showCallWindow: false, showCall: false }));
        if (PC) {
          PC.getSenders().forEach((sender) => PC.removeTrack(sender));
        }
        window.location.reload();
      };

      socket.on("guest-candidate", handleGuestCandidate);
      socket.on("candidate", handleCandidate);
      socket.on("answer", handleAnswer);
      socket.on("offer", handleOffer);
      socket.on("user-busy", handleUserBusy);
      socket.on("call-ended", handleCallEnded);

      return () => {
        socket.off("guest-candidate", handleGuestCandidate);
        socket.off("candidate", handleCandidate);
        socket.off("answer", handleAnswer);
        socket.off("offer", handleOffer);
        socket.off("user-busy", handleUserBusy);
        socket.off("call-ended", handleCallEnded);
        PC.onicecandidate = null;
        PC.ontrack = null;
      };
    }
  }, [PC, socket, guest]); // check deps carefully

  return (
    <PcContext.Provider value={{ PC, createOffer, createAnswer, createPeerConnection }}>
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
