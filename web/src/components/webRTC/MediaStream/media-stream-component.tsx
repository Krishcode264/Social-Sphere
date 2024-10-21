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

export const VideoComponent: React.FC<MediaProps> = ({ media ,target }) => {
  const videoref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    // console.log(media, "from video component ");
    if (videoref.current) {
      // console.log(media,"video src object here ")
       videoref.current.muted = true;
      videoref.current.srcObject = media;
      console.log(media.getTracks(), target)
      videoref.current.addEventListener("loadedmetadata", () => {
       
        videoref.current?.play().catch((err) => {
          console.log("error while playing video on loaded metatdata", err);
          throw err;
        });
      });
         videoref.current.addEventListener("error", (err) => {
           console.error("Video element error:", err);
         });
    }
  }, [videoref, media]);
  return (
    <div className="w-full h-full bg-slate-700  rounded-md   ">
      <video
        ref={videoref}
        className=" defaultvideo popupvideo rounded-sm  h-full w-full bg-cover "
         
        
        autoPlay={true}
      >
        <track kind="captions"></track>
      </video>
    </div>
  );
};

export const AudioComponent: React.FC<MediaProps> = ({ media ,target,u}) => {
  const audioref = useRef<HTMLAudioElement>(null);
         console.log(u)
  useEffect(() => {
    if (audioref.current) {
      audioref.current.srcObject = media;
      audioref.current.addEventListener("loadedmetadata", () => {
        audioref.current?.play().catch((err) => {
          console.log("error while playing video on loaded metatdata", err);
          throw err;
        });
      });
    }
  }, []);
  return (
   

     
        <audio ref={audioref} className="" muted={target==="local"? true : false}>
          <track kind="captions"></track>
        </audio>
      

  
  );
};
