import React, { useEffect, type Dispatch, type SetStateAction } from "react";
import MediaStream from "./MediaStream/media-stream";
import MediaStreamGuest from "./MediaStream/media-stream-guest";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { peerConnectionState } from "@/store/selectors/pc-selector";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import MediaPermission from "./MediaStream/media-permission";
import { usePC } from "@/context/peerConnectionContext";
import { showComponentState } from "@/store/atoms/show-component";
import { userPermissionState } from "@/store/atoms/user-permissions_atom";
import { CallWindowAtomState } from "@/store/atoms/callWindowStates";

const WebrtcConnection = () => {
  const [{ showmediaPermission }, setShowMedia] =
    useRecoilState(showComponentState);
  const setShowCompennts = useSetRecoilState(showComponentState);
  const { video, audio } = useRecoilValue(userPermissionState);
  const [{ audioStream, videoStream }, setMediaStreamAll] =
    useRecoilState(mediaStreamState);

  const { PC } = usePC();
  // const { mode } = useRecoilValue(CallWindowAtomState);

  const addTracksToExistingStream = (newStream: MediaStream, mode: string) => {
    if (mode === "audio") {
      setMediaStreamAll((prev) => ({
        ...prev,

        audioStream: newStream,
      }));
      return;
    }
    if (mode === "video") {
      setMediaStreamAll((prev) => ({
        ...prev,
        videoStream: newStream,
      }));
    }
  };

  const addtrackTOPC = (stream: MediaStream, mode: string) => {
    const senders = PC?.getSenders();

    stream.getTracks().forEach((track) => {
      const trackAlreadyExists = senders?.some(
        (sender) => sender.track === track
      );

      if (!trackAlreadyExists) {
        PC?.addTrack(track, stream);
        console.log("Track added to peer connection:", track);
      } else {
        console.log("Track already exists in peer connection:", track);
      }
    });
    console.log(stream.getTracks(), "tracks of the stream");

    addTracksToExistingStream(stream, mode);
  };

  const getMedia = async (mode: string) => {
    const params = mode === "audio" ? { audio: true } : { video: true };
    const mediaStream = await navigator.mediaDevices.getUserMedia(params);
    addtrackTOPC(mediaStream, mode);
  };

  return <MediaStream getMedia={getMedia} />;
};

export default WebrtcConnection;
