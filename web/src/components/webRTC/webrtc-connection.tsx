import React, { useEffect } from "react";
import MediaStream from "./MediaStream/media-stream";
import MediaStreamGuest from "./MediaStream/media-stream-guest";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { peerConnectionState } from "@/store/selectors/pc-selector";
import { remoteStreamState } from "@/store/selectors/media-state-selector";
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
  const [{ tracksAdded, mediaStream, remoteStream }, setMediaStreamAll] =
    useRecoilState(mediaStreamState);

  const { PC, createOffer } = usePC();
  // const { mode } = useRecoilValue(CallWindowAtomState);

  const addTracksToExistingStream = (newStream: MediaStream) => {
    if (!mediaStream) {
      setMediaStreamAll((prev) => ({
        ...prev,
        mediaStream: newStream, 
        tracksAdded: true,
      }));
      return;
    }

    newStream.getTracks().forEach((track) => {
      mediaStream.addTrack(track);
    });

    setMediaStreamAll((prev) => ({
      ...prev,
      mediaStream: mediaStream,
      tracksAdded: true,
    }));
  };

  const addtrackTOPC = (stream: MediaStream) => {
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

    addTracksToExistingStream(stream);
  };

  const getMedia = async (mode: string) => {
    const params = mode === "audio" ? { audio: true } : { video: true };
    const mediaStream = await navigator.mediaDevices.getUserMedia(params);
    addtrackTOPC(mediaStream);
  };

  return (
    <div className="flex flex-col  md:flex-row h-[85%] w-full     min-h-44 sm:min-h-96    gap-2 justify-between items-start p-4">
      {<MediaStream getMedia={getMedia} />}
      <MediaStreamGuest />
    </div>
  );
};

export default WebrtcConnection;
