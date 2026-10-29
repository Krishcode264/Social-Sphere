import React from "react";
import MediaStream from "./MediaStream/media-stream";
import { useRecoilState } from "recoil";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { usePC } from "@/context/peerConnectionContext";

const WebrtcConnection = () => {
  const [{ audioStream, videoStream }, setMediaStreamAll] =
    useRecoilState(mediaStreamState);
  const { PC, attachLocalTrackToPC } = usePC();

  const addTracksToExistingStream = (newStream: MediaStream, mode: string) => {
    if (mode === "audio") {
      setMediaStreamAll((prev) => ({
        ...prev,
        audioStream: newStream,
      }));
      return;
    }
    if (mode === "video") {
      setMediaStreamAll((prev) => ({
        ...prev,
        videoStream: newStream,
      }));
    }
  };

  const addtrackTOPC = async (stream: MediaStream, mode?: string) => {
    const kind = mode === "video" ? "video" : "audio";
    const track = kind === "video" ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
    if (track) {
      await attachLocalTrackToPC(track, kind);
    }
    if (mode) {
      addTracksToExistingStream(stream, mode);
    }
  };

  const getMedia = async (mode: string, attachToPC: boolean = false): Promise<MediaStream | null> => {
    try {
      const params = mode === "audio" ? { audio: true } : { video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(params);
      if (attachToPC) {
        await addtrackTOPC(mediaStream, mode);
      } else {
        addTracksToExistingStream(mediaStream, mode);
      }
      return mediaStream;
    } catch (err) {
      console.warn(`Local ${mode} permission not granted or device not available:`, err);
      return null;
    }
  };

  return <MediaStream getMedia={getMedia} addtrackTOPC={addtrackTOPC} />;
};

export default WebrtcConnection;
