
"use client "
import { atom } from "recoil";

export interface MediaStreamState {
  audioStream: MediaStream | null;
  videoStream: MediaStream | null;
  video: boolean;
  audio: boolean;
}

export const mediaStreamState=atom<MediaStreamState>({
    key:"media-stream",
    default:{
        audioStream:null,
        videoStream:null,
        video:false,
        audio:false
    }
})

export type RemoteStreamStateType={
    audio:null|MediaStream;
    video:null|MediaStream;
    screen:null|MediaStream;
}
export const remoteStreamState=atom<RemoteStreamStateType>({
    key:"remote-stream",
    default:{
        audio:null,
        video:null,
        screen:null
    }
})