
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

export type RemoteMediaStateType = {
  audio: boolean;
  video: boolean;
};

/**
 * UI truth for the REMOTE peer's mic/camera state.
 * Driven only by explicit `media-state` signaling messages,
 * NOT by track existence (pre-negotiated tracks exist even when off).
 */
export const remoteMediaState = atom<RemoteMediaStateType>({
  key: "remote-media-state",
  default: { audio: false, video: false },
});