
"use client "
import { atom } from "recoil";

export interface MediaStreamState{
    mediaStream:MediaStream|null,
    tracksAdded:boolean,
    remoteStream:MediaStream|null,
    video:boolean,
    audio:boolean
}

export const mediaStreamState=atom<MediaStreamState>({
    key:"media-stream",
    default:{
        mediaStream:null,
        tracksAdded:false,
        remoteStream:null,
        video:false,
        audio:false
    }
})