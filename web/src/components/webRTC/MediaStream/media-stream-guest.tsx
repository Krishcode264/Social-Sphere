import React, { useEffect } from "react";
import { useState } from "react";
import { VideoComponent, AudioComponent } from "./media-stream-component";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { mediaStreamState } from "../../../store/atoms/media-stream-atom";
import { ToggleButtons } from "./media-stream";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import { callState } from "@/store/atoms/calling-state";
import { usePC } from "@/context/peerConnectionContext";
import { remoteStreamState } from "@/store/selectors/media-state-selector";

const MediaStreamGuest:React.FC = () => {
  const {remoteStream}=useRecoilValue(mediaStreamState)
    


  return (
    <div className="flex flex-colitems-center mx-auto  h-34 md:h-full  ">
      <div className=" h-full border w-full">
        {remoteStream && <VideoComponent media={remoteStream} target="remote"/>   }
     
      </div>
    
    </div>
  );
};

export default MediaStreamGuest;
