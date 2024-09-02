import React, { useEffect } from "react";
import { useState } from "react";
import { VideoComponent, AudioComponent } from "./media-stream-component";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { mediaStreamState, remoteStreamState } from "../../../store/atoms/media-stream-atom";
import { ToggleButtons } from "./media-stream";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import { callState } from "@/store/atoms/calling-state";
import { usePC } from "@/context/peerConnectionContext";
import { guestState } from "@/store/atoms/guest-atom";
import Image from "next/image";
import i2 from '@/images/duf.webp'
import { CallWindowAtomState } from "@/store/atoms/callWindowStates";
const MediaStreamGuest:React.FC = () => {
  const {audio ,video,screen}=useRecoilValue(remoteStreamState)
      const guest = useRecoilValue(guestState);
      const {screenSize}=useRecoilValue(CallWindowAtomState)
  return (
    <div className={`${screenSize==="popout"? "popupremotestream": "defaultremotestream"} rounded-md `}>
      {video && <VideoComponent media={video} target="remote" u={guest} />}
      {audio && <AudioComponent media={audio} target="remote" u={guest} />}
      {screen && <VideoComponent media={screen} target="remote" u={guest} />}
      {!video && !audio && !screen && (
        <>
          <div className=" bg-slate-700 flex items-center justify-center w-full h-full rounded-md">
            <Image
              alt="guest image m-2"
              unoptimized={true}
              width={5}
              height={5}
              src={guest.profile || i2}
              className="w-24 h-24  rounded-full "
            ></Image>
          </div>
        </>
      )}
    </div>
  );
};

export default MediaStreamGuest;
