import React from "react";
import MediaStream from "./MediaStream/media-stream";
import { useRecoilState } from "recoil";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { usePC } from "@/context/peerConnectionContext";

const WebrtcConnection = () => {
  const [mediaState, setMediaStreamAll] = useRecoilState(mediaStreamState);
  const { attachLocalTrackToPC } = usePC();

  const storeStream = (newStream: MediaStream, kind: "audio" | "video") => {
    // release the previous device slot before swapping in the new stream
    const previous = kind === "audio" ? mediaState.audioStream : mediaState.videoStream;
    const oldTrack = kind === "audio" ? previous?.getAudioTracks() : previous?.getVideoTracks();
    oldTrack?.forEach((t) => {
      try {
        t.stop();
      } catch {}
    });
    setMediaStreamAll((prev) =>
      kind === "audio" ? { ...prev, audioStream: newStream } : { ...prev, videoStream: newStream }
    );
  };

  const getMedia = async (mode: string, attachToPC: boolean = false): Promise<MediaStream | null> => {
    try {
      const params = mode === "audio" ? { audio: true } : { video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(params);
      const kind = mode === "audio" ? "audio" : "video";
      if (attachToPC) {
        const track =
          kind === "audio" ? mediaStream.getAudioTracks()[0] : mediaStream.getVideoTracks()[0];
        if (track) await attachLocalTrackToPC(track, kind);
      }
      storeStream(mediaStream, kind);
      return mediaStream;
    } catch (err) {
      console.warn(`Local ${mode} permission not granted or device not available:`, err);
      return null;
    }
  };

  return <MediaStream getMedia={getMedia} />;
};

export default WebrtcConnection;
