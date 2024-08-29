import { useEffect } from "react";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { useRef } from "react";

interface MediaProps {
  media: MediaStream;
  target:string
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
    <video ref={videoref} className="h-full " muted={true} autoPlay={true}>
      <track kind="captions"></track>
    </video>
  );
};

export const AudioComponent: React.FC<MediaProps> = ({ media }) => {
  const audioref = useRef<HTMLAudioElement>(null);
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
    <div className="audio_container">
      <RecordVoiceOverIcon sx={{ fontSize: 85, color: "white" }} />
      <audio ref={audioref}>
        <track kind="captions"></track>
      </audio>
    </div>
  );
};
