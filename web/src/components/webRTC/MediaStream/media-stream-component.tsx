import { useEffect } from "react";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { useRef } from "react";
import Image from "next/image";
import { useRecoilState, useRecoilValue } from "recoil";
import type { User } from "@/types/types";

interface MediaProps {
  media: MediaStream;
  target:string;
  u:User
}

export const VideoComponent: React.FC<MediaProps> = ({ media, target }) => {
  const videoref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    const videoEl = videoref.current;
    if (videoEl && media) {
      videoEl.muted = target === "local";
      videoEl.srcObject = media;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (isMounted && err.name !== "AbortError") {
            console.log("Video auto-play:", err);
          }
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [media, target]);

  return (
    <div className="w-full h-full bg-slate-700 rounded-md">
      <video
        ref={videoref}
        className="defaultvideo popupvideo rounded-sm h-full w-full bg-cover"
        autoPlay
        playsInline
        muted={target === "local"}
      >
        <track kind="captions"></track>
      </video>
    </div>
  );
};

export const AudioComponent: React.FC<MediaProps> = ({ media, target }) => {
  const audioref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let isMounted = true;
    const audioEl = audioref.current;
    if (audioEl && media) {
      audioEl.muted = target === "local";
      audioEl.srcObject = media;
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (isMounted && err.name !== "AbortError") {
            console.log("Audio auto-play failed:", err);
          }
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [media, target]);

  return (
    <audio ref={audioref} autoPlay playsInline muted={target === "local"}>
      <track kind="captions"></track>
    </audio>
  );
};
