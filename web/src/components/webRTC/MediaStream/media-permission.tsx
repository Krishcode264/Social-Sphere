import React from "react";
import CameraIcon from "@mui/icons-material/Camera";
import MicIcon from "@mui/icons-material/Mic";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userPermissionState } from "@/store/atoms/user-permissions_atom";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { peerConnectionState } from "@/store/selectors/pc-selector";
import { usePC } from "@/context/peerConnectionContext";
const MediaPermission = () => {
  const { video, audio } = useRecoilValue(userPermissionState);
  const setMediaStreamAll = useSetRecoilState(mediaStreamState);
  const peerConnection = usePC()

  const getUserMediaStream = () => {
    const setDefaultdisabledTracks = (stream: MediaStream) => {
      stream.getTracks().forEach((track) => {
        track.enabled = false;
        peerConnection?.addTrack(track, stream);
      });

     // console.log("stream after track.enable=false ", stream.getTracks());
      setMediaStreamAll((prev) => ({
        ...prev,
        mediaStream: stream,
        tracksAdded: true,
        video: false,
        audio: false,
      }));
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("got the strem here 1 ")
        setDefaultdisabledTracks(stream);
      })
      .catch((err) => {
        console.log("errro getiig n stream")
        throw err;
      });
  };

  useEffect(() => {
    console.log(video, audio, "from medi permission");
    if (audio === "granted" && video === "granted") {
      console.log("this is running");
      getUserMediaStream();
    }
  }, [video, audio]);

  return (
    <div className="  text-slate-800 bg-gradient-to-br from-sky-900 to-blue-900 shadow-lg shadow-sky-700 p-6 w-3/5 md:w-1/2 m-auto flex flex-col items-center rounded-xl relative top-40">
      <p className="text-xl text-slate-400">
        we need acces to your camera and microphone
      </p>
      <div className="m-auto">
        <CameraIcon sx={{ fontSize: "33px" }} />
        <MicIcon sx={{ fontSize: "33px" }} />
      </div>
      <button
        className="p-1  text-slate-800 bg-sky-700 hover:bg-sky-600    mt-4 text-xl font-semibold rounded-lg"
        onClick={getUserMediaStream}
      >
        Give Access
      </button>
    </div>
  );
};

export default MediaPermission;
