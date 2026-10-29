"use client";
import { userInfoState } from "@/store/selectors/user-selector";
import { toast } from "sonner";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const configForPeerconnection: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:stun.services.mozilla.com" },
      { urls: "stun:global.stun.twilio.com:3478" },
    ],
    iceCandidatePoolSize: 10,
  };
  const [guest, setGuest] = useRecoilState(guestState);
  const offerer = useRecoilValue(userInfoState);
  const socket = useSocket();
  const [callStates, setCallState] = useRecoilState(callState);
  const setShowComponent = useSetRecoilState(showComponentState);
  const [offer, setOffer] = useRecoilState(offerState);
  const setStream = useSetRecoilState(remoteStreamState);
  const iceCandidateBuffer: RTCIceCandidate[] = [];
  const pendingCandidates: RTCIceCandidateInit[] = [];

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

  const flushPendingCandidates = async (peer: RTCPeerConnection) => {
    while (pendingCandidates.length > 0) {
      const cand = pendingCandidates.shift();
      if (cand) {
        try {
          await peer.addIceCandidate(cand);
        } catch (err) {
          console.error("Error adding queued candidate:", err);
        }
      }
    }
  };

  const addCandidateSafely = async (candidate: RTCIceCandidateInit) => {
    if (!PC) return;
    try {
      if (PC.remoteDescription && PC.remoteDescription.type) {
        await PC.addIceCandidate(candidate);
      } else {
        pendingCandidates.push(candidate);
      }
    } catch (err) {
      console.error("Error in addCandidateSafely:", err);
    }
  };

  const createOffer = async (): Promise<RTCSessionDescriptionInit | undefined> => {
    try {
      if (!guest?.id) {
        console.log("No guest ID to create offer for");
        return undefined;
      }
      const createdOffer = await PC?.createOffer();
      if (createdOffer && PC) {
        await PC.setLocalDescription(createdOffer);
        socket?.emit("offer", { offer: createdOffer, guest, offerer });
        console.log("emitting offer to guest:", guest.id);
        return createdOffer;
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      return undefined;
    }
  };

  const createAnswer = async () => {
    if (offer && PC) {
      await PC.setRemoteDescription(offer);
      await flushPendingCandidates(PC);
      const createdAnswer = await PC.createAnswer();
      if (createdAnswer) {
        await PC.setLocalDescription(createdAnswer);
        socket?.emit("answer", {
          answer: createdAnswer,
          guest,
          offerer,
        });
        setCallState(() => ({ status: "calling", action: "receiver" }));
      }
    }
  };

  const callStateRef = useRef(callStates);
  useEffect(() => {
    callStateRef.current = callStates;
  }, [callStates]);

  useEffect(() => {
    if (PC && socket) {
      PC.onnegotiationneeded = async () => {
        try {
          if (guest?.id && (callStateRef.current.status === "calling" || callStateRef.current.status === "incall")) {
            console.log("Renegotiation needed - creating new offer for guest:", guest.id);
            await createOffer();
          }
        } catch (err) {
          console.error("Renegotiation failed:", err);
        }
      };

      PC.onicecandidate = (event) => {
        if (event.candidate) {
          if (guest?.id) {
            socket.emit("ice-candidate", { candidate: event.candidate, guest, offerer });
          }
          iceCandidateBuffer.push(event.candidate);
        }
      };

      PC.ontrack = (e: RTCTrackEvent) => {
        console.log("PC.ontrack event track kind:", e.track.kind, "id:", e.track.id);
        const incomingStream = (e.streams && e.streams[0]) ? e.streams[0] : new MediaStream([e.track]);

        if (e.track.kind === "video") {
          console.log("setting up video remote stream");
          setStream((prev) => ({ ...prev, video: incomingStream }));
        } else if (e.track.kind === "audio") {
          console.log("setting up audio remote stream");
          setStream((prev) => ({ ...prev, audio: incomingStream }));
        }

        e.track.onended = () => {
          if (e.track.kind === "video") {
            setStream((prev) => ({ ...prev, video: null }));
          } else if (e.track.kind === "audio") {
            setStream((prev) => ({ ...prev, audio: null }));
          }
        };
      };

      const emitcandidates = () => {
        if (guest?.id && iceCandidateBuffer.length > 0) {
          socket.emit("guest-candidate", { iceCandidateBuffer, guest, offerer });
        }
      };

      const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (candidate) {
          await addCandidateSafely(candidate);
        }
      };

      const handleGuestCandidate = async ({ iceCandidateBuffer: receivedCandidates }: Candidate) => {
        if (Array.isArray(receivedCandidates)) {
          for (const cand of receivedCandidates) {
            await addCandidateSafely(cand);
          }
        }
      };

      const handleCandidate = async ({ iceCandidateBuffer: receivedCandidates }: Candidate) => {
        if (Array.isArray(receivedCandidates)) {
          for (const cand of receivedCandidates) {
            await addCandidateSafely(cand);
          }
        }
        emitcandidates();
      };

      const handleAnswer = async (data: any) => {
        if (guest.id === data.offerer.id && PC) {
          console.log("getting answer from guest:", data.offerer.id);
          await PC.setRemoteDescription(data.answer);
          await flushPendingCandidates(PC);
          setCallState((prev) => ({ ...prev, status: "incall" }));
          if (iceCandidateBuffer.length > 0) {
            socket.emit("candidate", { iceCandidateBuffer, guest, offerer });
            iceCandidateBuffer.length = 0;
          }
        }
      };

      const handleOffer = async (data: any) => {
        console.log("getting offer from:", data.offerer?.id);
        const isRenegotiation =
          (guest.id && data.offerer?.id && guest.id === data.offerer.id) ||
          (callStateRef.current.status === "calling" || callStateRef.current.status === "incall");

        if (isRenegotiation) {
          console.log("Renegotiation offer from current peer - auto-answering");
          try {
            await PC.setRemoteDescription(data.offer);
            await flushPendingCandidates(PC);
            const answer = await PC.createAnswer();
            await PC.setLocalDescription(answer);
            socket.emit("answer", {
              answer,
              guest: data.offerer,
              offerer: offerer,
            });
          } catch (err) {
            console.error("Error handling renegotiation offer:", err);
          }
          return;
        }

        if (
          callStateRef.current.status === "calling" ||
          callStateRef.current.status === "incall" ||
          PC.remoteDescription
        ) {
          console.log("user is busy ");
          socket.emit("busy", data);
          return;
        }

        console.log("incoming call offer from:", data.offerer);
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
          style: { background: "orange", color: "white", fontWeight: 700 },
        });
      };

      const handleCallEnded = ({ by }: { by: any }) => {
        console.log("Call ended by:", by?.name);
        toast(`${by?.name || "User"} ended the call.`, {
          style: { background: "red", color: "white", fontWeight: 700 },
        });
        setCallState({ status: "default", action: "default" });
        setGuest({ id: "", name: "" });
        setShowComponent((prev) => ({ ...prev, showCallWindow: false, showCall: false }));
        if (PC) {
          PC.getSenders().forEach((sender) => {
            try {
              PC.removeTrack(sender);
            } catch (e) {}
          });
        }
        createPeerConnection();
      };

      socket.on("ice-candidate", handleIceCandidate);
      socket.on("guest-candidate", handleGuestCandidate);
      socket.on("candidate", handleCandidate);
      socket.on("answer", handleAnswer);
      socket.on("offer", handleOffer);
      socket.on("user-busy", handleUserBusy);
      socket.on("call-ended", handleCallEnded);

      return () => {
        socket.off("ice-candidate", handleIceCandidate);
        socket.off("guest-candidate", handleGuestCandidate);
        socket.off("candidate", handleCandidate);
        socket.off("answer", handleAnswer);
        socket.off("offer", handleOffer);
        socket.off("user-busy", handleUserBusy);
        socket.off("call-ended", handleCallEnded);
        PC.onnegotiationneeded = null;
        PC.onicecandidate = null;
        PC.ontrack = null;
      };
    }
  }, [PC, socket, guest]);

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
