
"use client"
import { atom } from "recoil";
interface PCState{
  peerConnection: RTCPeerConnection | null;
  peerConnectionStatus: string;
};
export const pcState=atom<PCState>({
    key:"pc-state",
    default:{
        peerConnection:null,
        peerConnectionStatus:'',  
    }
});

type OfferState = RTCSessionDescriptionInit|null|undefined;


export const offerState= atom<OfferState>({
  key: "offer-state",
  default: null,
  
});