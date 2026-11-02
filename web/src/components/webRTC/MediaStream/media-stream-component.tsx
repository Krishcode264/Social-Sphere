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

      const attemptPlay = () => {
        if (!isMounted) return;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (isMounted && err.name !== "AbortError") {
              console.log("Video auto-play:", err);
            }
          });
        }
      };

      videoEl.onloadedmetadata = () => {
        attemptPlay();
      };

      attemptPlay();
    }
    return () => {
      isMounted = false;
      if (videoEl) {
        videoEl.onloadedmetadata = null;
      }
    };
  }, [media, target]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-800 rounded-md flex items-center justify-center">
      <video
        ref={videoref}
        className="w-full h-full object-cover rounded-md"
        style={{
          transform: target === "local" ? "scaleX(-1)" : "none",
        }}
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
