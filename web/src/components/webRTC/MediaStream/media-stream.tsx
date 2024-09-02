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
import Image from "next/image";
import i2 from "@/images/duf.webp";
import MediaStreamGuest from "./media-stream-guest";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import ZoomInMapOutlinedIcon from "@mui/icons-material/ZoomInMapOutlined";
import ZoomOutMapOutlinedIcon from "@mui/icons-material/ZoomOutMapOutlined";
import { Tooltip } from "@mui/material";
import { CallWindowAtomState } from "@/store/atoms/callWindowStates";

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
  const [{ audioStream, videoStream }, setMedia] =
    useRecoilState(mediaStreamState);
  const setShowCompennts = useSetRecoilState(showComponentState);
  const [guest, setGuest] = useRecoilState(guestState);
  const offerer = useRecoilValue(userInfoState);
  const socket = useSocket();
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
      socket?.emit("end-call", { guest, offerer });
      setAudio(false);
      setVideo(false);
      videoStream?.getTracks().forEach((track) => track.stop());
      audioStream?.getTracks().forEach((track) => track.stop());

      // if (PC) {
      //   PC.onicecandidate = null;
      //   PC.ontrack = null;
      //   PC.oniceconnectionstatechange = null;
      //   PC.ondatachannel = null;
      // }

      setMedia((prev) => ({
        audioStream: null,
        videoStream: null,
        video: false,
        audio: false,
      }));

      setGuest((prev) => ({ name: "", id: "", profile: "" }));
      setcallstate(() => ({ action: "default", status: "default" }));
      setShowCompennts((prev) => ({ ...prev, showCallWindow: false }));
    }
  };
  const u = useRecoilValue(userInfoState);
  const [{ screenSize }, setScreenSize] = useRecoilState(CallWindowAtomState);
  return (
    <div
      className={` ${
        screenSize === "default" ? "defaultmediastream" : "popupmediastream"
      } justify-between `}
    >
      <div
        className={`${
          screenSize === "default"
            ? "defaultvideocontainer"
            : "popupvideocontainer"
        } `}
      >
        {/* w-full h-full mb:h-[50%] sm:h-full */}
        <div
          className={`${
            screenSize === "default"
              ? "defaultlocalstream "
              : " popuplocalstream "
          } bg-slate-700 rounded-md}`}
        >
          {videoStream && video && (
            <VideoComponent media={videoStream} target="local" u={u} />
          )}
          {!video && (
            <div className="  w-full h-full  bg-slate-700  rounded-md flex items-center justify-center">
              <Image
                alt="guest image m-2"
                unoptimized={true}
                width={5}
                height={5}
                src={u.profile || i2}
                className="w-24 h-24  rounded-full "
              ></Image>
            </div>
          )}
          {audioStream && (
            <AudioComponent media={audioStream} target="local" u={u} />
          )}
        </div>

        {/* {screen && <VideoComponent media={screen} target="local" />} */}
        {/* {videoStream && video && (
            <VideoComponent media={videoStream} target="local" u={u} />
          )} */}
        <MediaStreamGuest />
      </div>

      <div
        className={`
          ${
            screenSize === "default"
              ? " defaultbottombuttons "
              : "popupbottombuttons"
          }  `}
      >
        {/* <div className=" flex w-[50%] gap-3 border justify-end "> */}
        <div
          style={{
            backgroundColor: video ? "white" : "black",
            color: video ? "#334155" : "white",
          }}
          className="w-10  h-10 p-2 xl:w-14 xl:h-14 xl:p-4 rounded-full  flex items-center justify-center ml-auto"
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
          className="w-10  h-10 p-2 xl:w-14 xl:h-14 xl:p-4  rounded-full  flex items-center justify-center"
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
          className="w-10  h-10 p-2 xl:w-14 xl:h-14 xl:p-4 rounded-full flex items-center justify-center "
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
          {/* </div> */}
        </div>
        <div className=" text-orange-700  hover:cursor-pointer  flex   gap-2    justify-end ml-auto">
          {screenSize === "default" ? (
            <button
              className="hover:text-orange-500"
              onClick={() => {
                setScreenSize((prev) => ({ ...prev, screenSize: "popout" }));
              }}
            >
              <Tooltip
                title="pop out call window"
                translate="yes"
                enterTouchDelay={1}
              >
                <CloseFullscreenRoundedIcon className="text-2xl " />
              </Tooltip>
            </button>
          ) : (
            <button
              className="hover:text-orange-500"
              onClick={() => {
                setScreenSize((prev) => ({ ...prev, screenSize: "default" }));
              }}
            >
              <ZoomOutMapOutlinedIcon className="text-2xl " />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaStream;
