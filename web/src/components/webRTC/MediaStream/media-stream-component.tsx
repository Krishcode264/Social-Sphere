import { useEffect } from "react";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { useRef } from "react";

interface MediaProps {
  media: MediaStream;
}

export const VideoComponent: React.FC<MediaProps> = ({ media }) => {
  const videoref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    console.log(media, "from video component ");
    if (videoref.current) {
      videoref.current.srcObject = media;

      videoref.current.addEventListener("loadedmetadata", () => {
        videoref.current?.play().catch((err) => {
          console.log("error while playing video on loaded metatdata", err);
          throw err;
        });
      });
    }
  }, []);
  return (
    <video ref={videoref} className="rounded-lg">
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
