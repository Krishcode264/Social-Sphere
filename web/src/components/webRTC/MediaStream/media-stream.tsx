import React, { useEffect, useRef, useState } from "react";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { AudioComponent, VideoComponent } from "./media-stream-component";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { mediaStreamState } from "../../../store/atoms/media-stream-atom";
import { usePC } from "@/context/peerConnectionContext";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import { CallEndRounded } from "@mui/icons-material";
import { CallOutlined } from "@mui/icons-material";
import { showComponentState } from "@/store/atoms/show-component";
import { callState, rtcConnectionState } from "@/store/atoms/calling-state";
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
import { toast } from "sonner";

const DEBUG_RTC = process.env.NEXT_PUBLIC_DEBUG_RTC !== "false";
const dlog = (...args: any[]) => {
  if (DEBUG_RTC) console.log("[UI]", new Date().toISOString(), ...args);
};

const RING_TIMEOUT_MS = 45000;

const MediaStream: React.FC<{ getMedia: (s: string, attachToPC?: boolean) => Promise<MediaStream | null> }> = ({
  getMedia,
}) => {
  const { createOffer, createAnswer, ensureCallerTransceivers, attachLocalTrackToPC, sendMediaState, cleanupCall, prepareForCall } =
    usePC();
  const [audio, setAudio] = useState(false);
  const [video, setVideo] = useState(false);
  const [userCallState, setcallstate] = useRecoilState(callState);
  const [mediaState, setMedia] = useRecoilState(mediaStreamState);

  const setShowCompennts = useSetRecoilState(showComponentState);
  const [guest, setGuest] = useRecoilState(guestState);
  const { mode } = useRecoilValue(CallWindowAtomState);

  const offerer = useRecoilValue(userInfoState);
  const socket = useSocket();

  // refs mirroring state to avoid stale closures on rapid taps
  const audioRef = useRef(false);
  const videoRef = useRef(false);
  const guestRef = useRef(guest);
  const streamsRef = useRef({ audioStream: null as MediaStream | null, videoStream: null as MediaStream | null });
  const togglesBusyRef = useRef<{ audio: boolean; video: boolean }>({ audio: false, video: false });
  const ringTimerRef = useRef<number | null>(null);
  const callStateRef = useRef(userCallState);

  useEffect(() => {
    guestRef.current = guest;
  }, [guest]);
  useEffect(() => {
    callStateRef.current = userCallState;
  }, [userCallState]);
  useEffect(() => {
    streamsRef.current = {
      audioStream: mediaState.audioStream,
      videoStream: mediaState.videoStream,
    };
  }, [mediaState]);
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);
  useEffect(() => {
    videoRef.current = video;
  }, [video]);

  // clear the ring timeout once the call is established
  useEffect(() => {
    if (userCallState.status === "incall" && ringTimerRef.current != null) {
      dlog("call established - clearing ring timeout");
      window.clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
  }, [userCallState.status]);

  /**
   * Local mic/camera toggles. Camera off stops the track (LED off);
   * mic mute uses track.enabled (instant). Emits `media-state` after
   * every settled change. Serialized per kind for rapid taps.
   */
  /**
   * Local mic/camera toggles. Camera off stops the track (LED off);
   * mic mute uses track.enabled (instant). Emits `media-state` after
   * every settled change. Serialized per kind for rapid taps.
   */
  const toggleTracks = async (type: string) => {
    if (type !== "audio" && type !== "video") return;
    if (togglesBusyRef.current[type]) {
      dlog(`toggle ${type} ignored - previous toggle still in flight`);
      return;
    }
    togglesBusyRef.current[type] = true;
    try {
      if (type === "video") {
        if (!videoRef.current) {
          // Release any existing dead video tracks before acquiring a fresh one
          if (streamsRef.current.videoStream) {
            streamsRef.current.videoStream.getVideoTracks().forEach((t) => {
              try {
                t.stop();
              } catch {}
            });
            streamsRef.current.videoStream = null;
          }

          // Camera ON: request fresh video stream from getUserMedia
          const stream = await getMedia("video");
          if (stream) {
            const track = stream.getVideoTracks()[0];
            if (track) {
              track.enabled = true;
              streamsRef.current.videoStream = stream;
              setMedia((prev) => ({ ...prev, videoStream: stream, video: true }));
              setVideo(true);
              videoRef.current = true;
              if (callStateRef.current.status === "incall") {
                await attachLocalTrackToPC(track, "video");
                sendMediaState({ audio: audioRef.current, video: true });
              }
            }
          } else {
            toast("Camera unavailable or blocked. Enable it in browser settings.", {
              style: { background: "orange", color: "white", fontWeight: 700 },
            });
          }
        } else {
          // Camera OFF: detach slot, stop track (LED off), clear stream
          if (callStateRef.current.status === "incall") {
            await attachLocalTrackToPC(null, "video");
            sendMediaState({ audio: audioRef.current, video: false });
          }
          streamsRef.current.videoStream?.getVideoTracks().forEach((t) => {
            try {
              t.stop();
            } catch {}
          });
          streamsRef.current.videoStream = null;
          setMedia((prev) => ({ ...prev, videoStream: null, video: false }));
          setVideo(false);
          videoRef.current = false;
        }
      }

      if (type === "audio") {
        if (!audioRef.current) {
          // Mic ON
          let stream = streamsRef.current.audioStream;
          let track = stream?.getAudioTracks()[0];
          if (!track || track.readyState === "ended") {
            stream = await getMedia("audio");
            track = stream?.getAudioTracks()[0];
          }
          if (stream && track) {
            track.enabled = true;
            streamsRef.current.audioStream = stream;
            setMedia((prev) => ({ ...prev, audioStream: stream, audio: true }));
            setAudio(true);
            audioRef.current = true;
            if (callStateRef.current.status === "incall") {
              await attachLocalTrackToPC(track, "audio");
              sendMediaState({ audio: true, video: videoRef.current });
            }
          } else {
            toast("Microphone unavailable or blocked. Enable it in browser settings.", {
              style: { background: "orange", color: "white", fontWeight: 700 },
            });
          }
        } else {
          // Mic MUTE
          if (callStateRef.current.status === "incall") {
            streamsRef.current.audioStream?.getAudioTracks().forEach((t) => {
              t.enabled = false;
            });
            sendMediaState({ audio: false, video: videoRef.current });
          } else {
            streamsRef.current.audioStream?.getAudioTracks().forEach((t) => {
              try {
                t.stop();
              } catch {}
            });
            streamsRef.current.audioStream = null;
            setMedia((prev) => ({ ...prev, audioStream: null, audio: false }));
          }
          setMedia((prev) => ({ ...prev, audio: false }));
          setAudio(false);
          audioRef.current = false;
        }
      }
    } finally {
      togglesBusyRef.current[type] = false;
    }
  };

  const closeWindow = () => {
    setShowCompennts((prev) => ({ ...prev, showCallWindow: false, showCall: false }));
    setcallstate(() => ({ action: "default", status: "default" }));
  };

  const handleCallWindowClose = () => {
    dlog("call window closed manually");
    if (
      (userCallState.status === "calling" ||
        userCallState.status === "incall" ||
        userCallState.action === "receiver") &&
      guest?.id
    ) {
      socket?.emit("end-call", { guest, offerer });
    }
    cleanupCall();
    closeWindow();
    setAudio(false);
    audioRef.current = false;
    setVideo(false);
    videoRef.current = false;
  };

  const attachCurrentTracks = async () => {
    // reuse preview tracks; no second getUserMedia here
    let anyAttached = false;
    const aTrack = streamsRef.current.audioStream?.getAudioTracks()[0];
    if (audioRef.current && aTrack && aTrack.enabled) {
      if (await attachLocalTrackToPC(aTrack, "audio")) anyAttached = true;
    }
    const vTrack = streamsRef.current.videoStream?.getVideoTracks()[0];
    if (vTrack && vTrack.enabled) {
      if (await attachLocalTrackToPC(vTrack, "video")) anyAttached = true;
      if (videoRef.current) {
        setMedia((prev) => ({ ...prev, video: true }));
      }
    } else {
      setMedia((prev) => ({ ...prev, video: false }));
    }
    return anyAttached;
  };

  const startCall = async () => {
    // 1. Offerer explicitly clicks the green call button to initiate the call!
    if (userCallState.action !== "receiver" && userCallState.status === "default") {
      if (!guest?.id) {
        toast("Choose a person to call first.", {
          style: { background: "orange", color: "white", fontWeight: 700 },
        });
        return;
      }
      if (!audioRef.current || !videoRef.current) {
        toast("Please turn on both camera and microphone before placing the call.", {
          style: { background: "#ea580c", color: "white", fontWeight: 700 },
        });
        return;
      }
      dlog("Initiating call to guest:", guest.id);
      // make sure the connection uses fresh TURN credentials for this call
      await prepareForCall();
      ensureCallerTransceivers();
      await attachCurrentTracks();

      setcallstate({ status: "calling", action: "offerer" });
      sendMediaState({ audio: true, video: true });
      await createOffer();
      // if nobody accepts, clean up after the ring timeout
      if (ringTimerRef.current != null) window.clearTimeout(ringTimerRef.current);
      ringTimerRef.current = window.setTimeout(() => {
        if (callStateRef.current.status === "calling" && guestRef.current?.id) {
          dlog("ring timeout - cancelling call");
          socket?.emit("end-call", { guest: guestRef.current, offerer });
          cleanupCall();
          closeWindow();
        }
      }, RING_TIMEOUT_MS);
      return;
    }

    // 2. Receiver answering the incoming call via the green button
    if (userCallState.action === "receiver" && userCallState.status === "default") {
      if (!audioRef.current || !videoRef.current) {
        toast("Please turn on both camera and microphone before picking up the call.", {
          style: { background: "#ea580c", color: "white", fontWeight: 700 },
        });
        return;
      }
      dlog("Receiver answering call from guest:", guest.id);
      await createAnswer();
      sendMediaState({ audio: true, video: true });
      return;
    }

    // 3. Ending active call (red button clicked)
    if (userCallState.status === "calling" || userCallState.status === "incall") {
      dlog("hanging up");
      if (guest?.id) {
        socket?.emit("end-call", { guest, offerer });
      }
      cleanupCall();
      closeWindow();
      setAudio(false);
      audioRef.current = false;
      setVideo(false);
      videoRef.current = false;
    }
  };

  const u = useRecoilValue(userInfoState);
  const [{ screenSize }, setScreenSize] = useRecoilState(CallWindowAtomState);
  const { status: rtcStatus } = useRecoilValue(rtcConnectionState);

  return (
    <div
      className={` ${screenSize === "default" ? "defaultmediastream" : "popupmediastream"
        } justify-between`}
    >
      {rtcStatus === "reconnecting" && (
        <div
          data-testid="reconnecting-banner"
          style={{ background: "#b45309", color: "white" }}
          className="text-white text-sm rounded-md px-3 py-2 m-2 text-center"
        >
          Reconnecting...
        </div>
      )}
      {/* Guidance banner based on call role & state */}
      {userCallState.status === "default" && userCallState.action !== "receiver" && (
        <div className="bg-slate-800/95 border-b border-slate-700 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <span>Call with <strong className="text-blue-400">{guest?.name || "Guest"}</strong></span>
            <span className="text-slate-400">| Turn on camera & mic before calling</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${video ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/30" : "bg-amber-600/30 text-amber-400 border border-amber-500/30"}`}>
              Camera {video ? "✓ ON" : "✕ OFF"}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${audio ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/30" : "bg-amber-600/30 text-amber-400 border border-amber-500/30"}`}>
              Mic {audio ? "✓ ON" : "✕ OFF"}
            </span>
          </div>
        </div>
      )}
      {userCallState.status === "default" && userCallState.action === "receiver" && (
        <div className="bg-indigo-950/95 border-b border-indigo-700/60 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Incoming call from <strong className="text-emerald-400">{guest?.name || "Guest"}</strong></span>
            <span className="text-slate-300">| Turn on camera & mic to pick up</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${video ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/30" : "bg-amber-600/30 text-amber-400 border border-amber-500/30"}`}>
              Camera {video ? "✓ ON" : "✕ OFF"}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${audio ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/30" : "bg-amber-600/30 text-amber-400 border border-amber-500/30"}`}>
              Mic {audio ? "✓ ON" : "✕ OFF"}
            </span>
          </div>
        </div>
      )}
      {userCallState.status === "calling" && (
        <div className="bg-blue-950/95 border-b border-blue-800 px-4 py-2 text-center text-xs text-blue-200">
          <span>Calling <strong className="text-white">{guest?.name || "Guest"}</strong>... Waiting for answer</span>
        </div>
      )}
      {userCallState.status === "incall" && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/60 px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-emerald-300">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>In call with <strong className="text-white">{guest?.name || "Guest"}</strong></span>
        </div>
      )}
      <div
        className={`${screenSize === "default"
            ? "defaultvideocontainer"
            : "popupvideocontainer"
          } `}
      >
        <div
          className={`${
            screenSize === "default" ? "defaultlocalstream" : "popuplocalstream"
          } bg-slate-800 rounded-md relative overflow-hidden flex items-center justify-center`}
        >
          {mediaState.videoStream && video ? (
            <VideoComponent media={mediaState.videoStream} target="local" u={u} />
          ) : (
            <div className="w-full h-full bg-slate-700 rounded-md flex items-center justify-center">
              <Image
                alt="local user"
                unoptimized={true}
                width={96}
                height={96}
                src={u.profile || i2}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}
          {mediaState.audioStream && (
            <AudioComponent media={mediaState.audioStream} target="local" u={u} />
          )}
        </div>

        <MediaStreamGuest />
      </div>

      <div
        className={`
          ${screenSize === "default"
            ? " defaultbottombuttons "
            : "popupbottombuttons"
          }  `}
      >
        {userCallState.status === "default" || userCallState.status === "rejected" ? (
          <div className="flex items-center justify-center">
            <Tooltip title="close the call window">
              <CloseIcon
                className="text-orange-600 text-2xl cursor-pointer"
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
          className="w-10 h-10 p-2 xl:w-14 xl:h-14 xl:p-4 rounded-full flex items-center justify-center ml-auto"
        >
          <button onClick={() => toggleTracks("video")}>
            {video ? <VideocamIcon /> : <VideocamOffIcon />}
          </button>
        </div>

        <div
          style={{
            backgroundColor: audio ? "white" : "black",
            color: audio ? "black" : "white",
          }}
          className="w-10 h-10 p-2 xl:w-14 xl:h-14 xl:p-4 rounded-full flex items-center justify-center"
        >
          <button onClick={() => toggleTracks("audio")} className="">
            {audio ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
          </button>
        </div>
        <div
          className={`w-10 h-10 p-2 xl:w-14 xl:h-14 xl:p-4 rounded-full flex items-center justify-center transition-all ${
            userCallState.status === "calling" || userCallState.status === "incall"
              ? "bg-red-600 hover:bg-red-700"
              : (!audio || !video)
              ? "bg-slate-700 opacity-60 cursor-not-allowed border border-slate-600"
              : "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/50 animate-pulse"
          }`}
          style={{
            color: "white",
          }}
        >
          <Tooltip
            title={
              userCallState.status === "calling" || userCallState.status === "incall"
                ? "End call"
                : userCallState.action === "receiver"
                ? (!audio || !video ? "Turn on camera and mic to pick up" : "Pick up call")
                : (!audio || !video ? "Turn on camera and mic to call" : "Start call")
            }
          >
            <button onClick={() => startCall()}>
              {userCallState.status === "calling" ||
              userCallState.status === "incall" ? (
                <CallEndRounded />
              ) : (
                <CallOutlined />
              )}
            </button>
          </Tooltip>
        </div>
        <div className="text-orange-700 hover:cursor-pointer flex gap-2 justify-end ml-auto">
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
                <CloseFullscreenRoundedIcon className="text-2xl" />
              </Tooltip>
            </button>
          ) : (
            <button
              className="hover:text-orange-500"
              onClick={() => {
                setScreenSize((prev) => ({ ...prev, screenSize: "default" }));
              }}
            >
              <ZoomOutMapOutlinedIcon className="text-2xl" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaStream;
