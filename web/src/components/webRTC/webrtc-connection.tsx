import React, { useEffect } from "react";
import MediaStream from "./MediaStream/media-stream";
import MediaStreamGuest from "./MediaStream/media-stream-guest";
import { useRecoilState, useRecoilValue } from "recoil";
import { peerConnectionState } from "@/store/selectors/pc-selector";
import { remoteStreamState } from "@/store/selectors/media-state-selector";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import MediaPermission from "./MediaStream/media-permission";
import { usePC } from "@/context/peerConnectionContext";

const WebrtcConnection = () => {
 
  const [remoteStream, setRemoteStream] = useRecoilState(remoteStreamState);
  const [{ mediaStream, tracksAdded }, setMediaStreamAll] = useRecoilState(mediaStreamState);
const peerConnection=usePC()
  useEffect(() => {
    if (peerConnection) {
      peerConnection.ontrack = (e: RTCTrackEvent) => {
        const rm = e.streams[0];
       // console.log("remote strem ontract event", rm);
        if (rm) {
          setRemoteStream(rm);
        }
      };
    }
  }, [peerConnection]);

  return (
    <div className=" ">
      {tracksAdded ? (
        <div className="flex bg-gradient-to-br sm:flex-row  flex-col   from-black to-slate-800  min-h-44 sm:min-h-96  h-fit  gap-2 justify-between items-end p-4">
          {mediaStream && <MediaStream />}
          {remoteStream && <MediaStreamGuest />}
        </div>
      ) : (
        <MediaPermission />
      )}
    </div>
  );
};

export default WebrtcConnection;
