import React, { useEffect } from "react";
import { useState } from "react";
import { VideoComponent, AudioComponent } from "./media-stream-component";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { mediaStreamState } from "../../../store/atoms/media-stream-atom";
import { ToggleButtons } from "./media-stream";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import { callState } from "@/store/atoms/calling-state";

const MediaStreamGuest:React.FC = () => {
  const [audio, setAudio] = useState(false);
  const [video, setVideo] = useState(false);
  const {remoteStream}=useRecoilValue(mediaStreamState)
  const setCallingState= useSetRecoilState(callState);


const toggleTracks=()=>{
  console.log("remote stream toggle tracts")
}
  useEffect(() => {
    if (remoteStream) {
      setCallingState("incall")
      console.log("we are inside guest vudei and we got remote stream ",remoteStream.getTracks())
      remoteStream.getTracks().forEach((track) => {
        if (track.kind === "audio") {
          setAudio(true);
        } else if (track.kind === "video") {
          setVideo(true);
        }
      });
    }
  }, [remoteStream]);



  return (
    <div className="flex flex-col flex-1 items-center mx-auto">
      <div className="">
        {remoteStream && video && <VideoComponent media={remoteStream} />}
        {remoteStream && audio && !video && (
          <AudioComponent media={remoteStream} />
        )}
      </div>
      <div className="p-1 text-sky-200">
        <ToggleButtons
          state={video}
          Icon={VideocamIcon}
          OppoIcon={VideocamOffIcon}
          toggleTracks={toggleTracks}
          type="video"
        />
        <ToggleButtons
          state={audio}
          Icon={MicIcon}
          toggleTracks={toggleTracks}
          OppoIcon={MicOffIcon}
          type="audio"
        />
      </div>
    </div>
  );
};

export default MediaStreamGuest;
