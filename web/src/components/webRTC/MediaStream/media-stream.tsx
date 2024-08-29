import React, { useEffect, useState } from "react";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import { AudioComponent, VideoComponent } from "./media-stream-component";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { peerConnectionState } from "../../../store/selectors/pc-selector";
import { mediaStreamState } from "../../../store/atoms/media-stream-atom";
import { usePC } from "@/context/peerConnectionContext";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import { CallEndRounded } from "@mui/icons-material";
import { CallOutlined } from "@mui/icons-material";
import { showComponentState } from "@/store/atoms/show-component";
import { callState } from "@/store/atoms/calling-state";
import { guestState } from "@/store/atoms/guest-atom";
import { userInfoState } from "@/store/selectors/user-selector";
import { useSocket } from "@/context/socketContext";
interface ToggleButtonsProps {
  state: boolean;
  Icon: React.FC;
  OppoIcon: React.FC;
  toggleTracks: (type: string) => void;
  type: string;
}
export const ToggleButtons: React.FC<ToggleButtonsProps> = ({
  state,
  Icon,
  OppoIcon,
  toggleTracks,
  type,
}) => {
  useEffect(() => {
    console.log("state chnaged ", state);
  }, [state]);
  const handleToggletracks = () => {
    toggleTracks(type);
  };
  return (
    <>
      <button className="toggle_btns" onClick={handleToggletracks}>
        {state && <Icon />}
        {!state && <OppoIcon />}
      </button>
    </>
  );
};
const MediaStream = ({ getMedia }: { getMedia: (s: string) => void }) => {
  const { PC, createOffer, createAnswer } = usePC();
  const [audio, setAudio] = useState(false);
  const [video, setVideo] = useState(false);
  const [userCallState, setcallstate] = useRecoilState(callState);
  const [{ mediaStream, remoteStream }, setMedia] =
    useRecoilState(mediaStreamState);
  const setShowCompennts = useSetRecoilState(showComponentState);
  const [guest, setGuest] = useRecoilState(guestState);
  const offerer=useRecoilValue(userInfoState)
  const socket=useSocket()
  const toggleTracks = (type: string) => {
    console.log("senders0", PC?.getSenders());
    if (
      PC?.getSenders().filter((sender) => sender.track?.kind === type)
        .length === 0
    ) {
      getMedia(type);
      type === "audio" ? setAudio(() => true) : setVideo(() => true);
      return;
    }

    PC?.getSenders().forEach((sender: RTCRtpSender) => {
      if (sender.track?.kind === type) {
        sender.track.enabled = !sender.track.enabled;
        console.log(type);
      }
    });
    type === "audio" ? setAudio((prev) => !prev) : setVideo((prev) => !prev);
  };

  const startCall = async () => {
    if (userCallState.action === "default") {
      await createOffer();
      setcallstate((prev) => ({ status: "calling", action: "offerer" }));
    }
    if (userCallState.action === "receiver") {
      await createAnswer();
    }

    if (
      userCallState.status === "calling" ||
      userCallState.status === "incall"
    ) {
      socket?.emit("end-call",{guest, offerer})
      setAudio(false);
      setVideo(false);
      mediaStream?.getTracks().forEach((track) => track.stop());
      remoteStream?.getTracks().forEach((track) => track.stop());
    
      // if (PC) {
      //   PC.onicecandidate = null;
      //   PC.ontrack = null;
      //   PC.oniceconnectionstatechange = null;
      //   PC.ondatachannel = null;
      // }

   
      setMedia((prev) => ({
        mediaStream: null,
        remoteStream: null,
        tracksAdded: false,
        video: false,
        audio: false,
      }));

      setGuest((prev) => ({ name: "", id: "", profile: "" }));
      setcallstate(() => ({ action: "default", status: "default" }));
      setShowCompennts((prev)=>({...prev ,showCallWindow:false }))
    }
  };

  return (
    <div className="flex flex-col  border  items-center  mx-auto gap-3 h-64  md:h-full">
      <div className="h-full border">
        {mediaStream && <VideoComponent media={mediaStream} target="local" />}
      </div>

      <div className="p-1 flex gap-3   ">
        <div
          style={{
            backgroundColor: video ? "white" : "black",
            color: video ? "#334155" : "white",
          }}
          className="w-12 h-12 p-4 rounded-full  flex items-center justify-center"
        >
          <button
            onClick={() => {
              toggleTracks("video");
            }}
          >
            {video ? <VideocamIcon /> : <VideocamOffIcon />}
          </button>
        </div>

        <div
          style={{
            backgroundColor: audio ? "white" : "black",
            color: audio ? "black" : "white",
          }}
          className="w-12 h-12 p-4 rounded-full  flex items-center justify-center"
        >
          <button
            onClick={() => {
              toggleTracks("audio");
            }}
            className=""
          >
            {audio ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
          </button>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center "
          style={{
            backgroundColor:
              userCallState.status === "calling" ||
              userCallState.status === "incall"
                ? "red"
                : "green",
            color: "white",
          }}
        >
          <button
            onClick={() => {
              startCall();
            }}
          >
            {userCallState.status === "calling" ||
            userCallState.status === "incall" ? (
              <CallEndRounded />
            ) : (
              <CallOutlined />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaStream;
