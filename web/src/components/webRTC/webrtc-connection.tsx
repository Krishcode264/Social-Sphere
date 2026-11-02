import React from "react";
import MediaStream from "./MediaStream/media-stream";

const WebrtcConnection = () => {
  const getMedia = async (mode: string): Promise<MediaStream | null> => {
    try {
      const params = mode === "audio" ? { audio: true } : { video: true };
      return await navigator.mediaDevices.getUserMedia(params);
    } catch (err) {
      console.warn(`Local ${mode} permission not granted or device not available:`, err);
      return null;
    }
  };

  return <MediaStream getMedia={getMedia} />;
};

export default WebrtcConnection;
