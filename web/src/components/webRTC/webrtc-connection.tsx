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
  const [permissionError, setPermissionError] = React.useState(false);

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

  const addtrackTOPC = (stream: MediaStream, mode?: string) => {
    const senders = PC?.getSenders();

    stream.getTracks().forEach((track) => {
      const trackAlreadyExists = senders?.some(
        (sender) => sender.track === track
      );

      if (!trackAlreadyExists && PC) {
        PC.addTrack(track, stream);
        console.log("Track added to peer connection:", track);
      } else {
        console.log("Track already exists in peer connection:", track);
      }
    });
    console.log(stream.getTracks(), "tracks of the stream");

    if (mode) {
      addTracksToExistingStream(stream, mode);
    }
  };

  const getMedia = async (mode: string, attachToPC: boolean = false): Promise<MediaStream | null> => {
    try {
      const params = mode === "audio" ? { audio: true } : { video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(params);
      if (attachToPC) {
        addtrackTOPC(mediaStream, mode);
      } else {
        addTracksToExistingStream(mediaStream, mode);
      }
      setPermissionError(false); // Clear error on success
      return mediaStream;
    } catch (err) {
      console.error("Failed to get media permissions:", err);
      setPermissionError(true);
      return null;
    }
  };

  if (permissionError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-[60] flex-col gap-4 text-center p-4">
        <h3 className="text-xl text-slate-200 font-semibold">Permission Required</h3>
        <p className="text-slate-400">Please allow access to your camera and microphone to continue the call.</p>
        <button
          onClick={() => {
            getMedia("audio", false);
            setPermissionError(false);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Retry Permission
        </button>
      </div>
    );
  }

  return <MediaStream getMedia={getMedia} addtrackTOPC={addtrackTOPC} />;
};

export default WebrtcConnection;
