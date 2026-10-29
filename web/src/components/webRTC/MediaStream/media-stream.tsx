import React, { useEffect, useState } from "react";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import { AudioComponent, VideoComponent } from "./media-stream-component";
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { peerConnectionState } from "../../../store/selectors/pc-selector";
import { mediaStreamState, remoteStreamState } from "../../../store/atoms/media-stream-atom";
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
import CloseIcon from "@mui/icons-material/Close";
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
interface MediaStreamProps {
  getMedia: (s: string, attachToPC?: boolean) => Promise<MediaStream | null>;
  addtrackTOPC: (stream: MediaStream, mode?: string) => Promise<void> | void;
}

const MediaStream: React.FC<MediaStreamProps> = ({ getMedia, addtrackTOPC }) => {
  const { PC, createOffer, createAnswer, createPeerConnection, attachLocalTrackToPC } = usePC();
  const [audio, setAudio] = useState(false);
  const [video, setVideo] = useState(false);
  const [userCallState, setcallstate] = useRecoilState(callState);
  const [{ audioStream, videoStream }, setMedia] =
    useRecoilState(mediaStreamState);
  const setShowCompennts = useSetRecoilState(showComponentState);
  const [guest, setGuest] = useRecoilState(guestState);
  const { mode } = useRecoilValue(CallWindowAtomState);

  const offerer = useRecoilValue(userInfoState);
  const socket = useSocket();
  console.log(userCallState, "user call state");

  const toggleTracks = async (type: string) => {
    if (type === "audio") {
      const nextAudio = !audio;
      setAudio(nextAudio);

      if (nextAudio) {
        let stream = audioStream;
        if (!stream || stream.getAudioTracks().length === 0) {
          stream = await getMedia("audio", false);
        }
        if (stream) {
          const track = stream.getAudioTracks()[0];
          if (track) {
            track.enabled = true;
            await attachLocalTrackToPC(track, "audio");
          }
        }
      } else {
        if (audioStream) {
          audioStream.getAudioTracks().forEach((t) => (t.enabled = false));
        }
        await attachLocalTrackToPC(null, "audio");
      }
    }

    if (type === "video") {
      const nextVideo = !video;
      setVideo(nextVideo);

      if (nextVideo) {
        let stream = videoStream;
        if (!stream || stream.getVideoTracks().length === 0) {
          stream = await getMedia("video", false);
        }
        if (stream) {
          const track = stream.getVideoTracks()[0];
          if (track) {
            track.enabled = true;
            await attachLocalTrackToPC(track, "video");
          }
        }
      } else {
        if (videoStream) {
          videoStream.getVideoTracks().forEach((t) => (t.enabled = false));
        }
        await attachLocalTrackToPC(null, "video");
      }
    }
  };

  const handleCallWindowClose = async () => {
    if (
      (userCallState.status === "calling" ||
        userCallState.status === "incall") &&
      guest?.id
    ) {
      socket?.emit("end-call", { guest, offerer });
    }
    videoStream?.getTracks().forEach((track) => track.stop());
    audioStream?.getTracks().forEach((track) => track.stop());
    setAudio(false);
    setVideo(false);
    resetRemoteStreamState();
    setGuest({ name: "", id: "", profile: "" });
    setcallstate(() => ({ action: "default", status: "default" }));
    setShowCompennts((prev) => ({ ...prev, showCallWindow: false }));
    createPeerConnection();
  };

  const resetRemoteStreamState = useResetRecoilState(remoteStreamState);

  const startCall = async () => {
    // 1. Offerer explicitly clicks the green call button in popup to initiate the call!
    if (
      userCallState.action === "default" &&
      userCallState.status === "default"
    ) {
      console.log("Green call button clicked: Initiating call to guest:", guest.id);

      // Attach enabled local tracks to PC before creating the offer
      if (audio && audioStream) {
        const track = audioStream.getAudioTracks()[0];
        if (track) await attachLocalTrackToPC(track, "audio");
      }
      if (video && videoStream) {
        const track = videoStream.getVideoTracks()[0];
        if (track) await attachLocalTrackToPC(track, "video");
      }

      setcallstate({ status: "calling", action: "offerer" });
      await createOffer();
      return;
    }

    // 2. Receiver answering the incoming call (if manual green button clicked)
    if (
      userCallState.action === "receiver" &&
      userCallState.status === "default"
    ) {
      console.log("Receiver answering call from guest:", guest.id);

      if (audio && audioStream) {
        const track = audioStream.getAudioTracks()[0];
        if (track) await attachLocalTrackToPC(track, "audio");
      }
      if (video && videoStream) {
        const track = videoStream.getVideoTracks()[0];
        if (track) await attachLocalTrackToPC(track, "video");
      }

      await createAnswer();
      return;
    }

    // 3. Ending active call (red button clicked)
    if (
      userCallState.status === "calling" ||
      userCallState.status === "incall"
    ) {
      if (guest?.id) {
        socket?.emit("end-call", { guest, offerer });
      }

      videoStream?.getTracks().forEach((track) => track.stop());
      audioStream?.getTracks().forEach((track) => track.stop());
      setAudio(false);
      setVideo(false);
      resetRemoteStreamState();
      if (PC) {
        PC.onicecandidate = null;
        PC.ontrack = null;
        PC.onnegotiationneeded = null;
        PC.close();
      }

      setMedia({
        audioStream: null,
        videoStream: null,
        video: false,
        audio: false,
      });

      setGuest({ name: "", id: "", profile: "" });
      setcallstate(() => ({ action: "default", status: "default" }));
      setShowCompennts((prev) => ({ ...prev, showCallWindow: false }));
      createPeerConnection();
    }
  };

  /* Preview setup: Offerer only previews locally; Receiver answers call immediately */
  useEffect(() => {
    const initCall = async () => {
      if (userCallState.action === "receiver") {
        // Receiver accepted incoming call: answer immediately to establish peer connection!
        console.log("Auto-answering incoming call as receiver");
        await createAnswer();

        // Optionally acquire media if user permits; doesn't block receiving media
        const aStream = await getMedia("audio", false);
        if (aStream) {
          setAudio(true);
          const track = aStream.getAudioTracks()[0];
          if (track) await attachLocalTrackToPC(track, "audio");
        }
        if (mode === "video" || mode === "") {
          const vStream = await getMedia("video", false);
          if (vStream) {
            setVideo(true);
            const track = vStream.getVideoTracks()[0];
            if (track) await attachLocalTrackToPC(track, "video");
          }
        }
      } else if (
        userCallState.action === "default" &&
        userCallState.status === "default"
      ) {
        // Offerer popup opened: pre-acquire local media for preview ONLY
        const aStream = await getMedia("audio", false);
        if (aStream) setAudio(true);
        if (mode === "video" || mode === "") {
          const vStream = await getMedia("video", false);
          if (vStream) setVideo(true);
        }
      }
    };
    initCall();
  }, []);

  const u = useRecoilValue(userInfoState);
  const [{ screenSize }, setScreenSize] = useRecoilState(CallWindowAtomState);
  return (
    <div
      className={` ${screenSize === "default" ? "defaultmediastream" : "popupmediastream"
        } justify-between `}
    >
      <div
        className={`${screenSize === "default"
            ? "defaultvideocontainer"
            : "popupvideocontainer"
          } `}
      >
        {/* w-full h-full mb:h-[50%] sm:h-full */}
        <div
          className={`${screenSize === "default"
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
          ${screenSize === "default"
            ? " defaultbottombuttons "
            : "popupbottombuttons"
          }  `}
      >
        {/* <div className=" flex w-[50%] gap-3 border justify-end "> */}

        {userCallState.status === "default" ||
          userCallState.status === "rejected" ? (
          <div className="flex items-center justify-center">
            <Tooltip title="close the call window">
              <CloseIcon
                className="  text-orange-600  text-2xl cursor-pointer"
                sx={{ color: "orange" }}
                onClick={handleCallWindowClose}
              />
            </Tooltip>
          </div>
        ) : null}

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
