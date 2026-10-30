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
          // camera ON: always request a fresh track
          const stream = await getMedia("video", false);
          if (stream) {
            // release the old device slot before attaching the new one
            streamsRef.current.videoStream?.getVideoTracks().forEach((t) => {
              try {
                t.stop();
              } catch {}
            });
            const track = stream.getVideoTracks()[0];
            if (track) {
              track.enabled = true;
              const attached = await attachLocalTrackToPC(track, "video");
              if (attached) {
                setMedia((prev) => ({ ...prev, videoStream: stream, video: true }));
                setVideo(true);
                videoRef.current = true;
                sendMediaState({ audio: audioRef.current, video: true });
              } else if (callStateRef.current.status !== "default") {
                // preview stage has no negotiated slots yet - that is expected
                toast("Camera slot not negotiated yet. Try again.", {
                  style: { background: "orange", color: "white", fontWeight: 700 },
                });
              }
            }
          } else {
            toast("Camera unavailable or blocked. Enable it in browser settings.", {
              style: { background: "orange", color: "white", fontWeight: 700 },
            });
          }
        } else {
          // camera OFF: detach slot, stop track (LED off), clear stream
          await attachLocalTrackToPC(null, "video");
          streamsRef.current.videoStream?.getVideoTracks().forEach((t) => {
            try {
              t.stop();
            } catch {}
          });
          setMedia((prev) => ({ ...prev, videoStream: null, video: false }));
          setVideo(false);
          videoRef.current = false;
          sendMediaState({ audio: audioRef.current, video: false });
        }
      }

      if (type === "audio") {
        if (!audioRef.current) {
          // mic first-time ON (or ON again after full release)
          let stream = streamsRef.current.audioStream;
          if (!stream || stream.getAudioTracks().length === 0) {
            stream = await getMedia("audio", false);
          }
          if (stream) {
            const track = stream.getAudioTracks()[0];
            if (track) {
              track.enabled = true;
              const attached = await attachLocalTrackToPC(track, "audio");
              if (attached) {
                setMedia((prev) => ({ ...prev, audioStream: stream, audio: true }));
                setAudio(true);
                audioRef.current = true;
                sendMediaState({ audio: true, video: videoRef.current });
              } else if (callStateRef.current.status !== "default") {
                toast("Audio slot not negotiated yet. Try again.", {
                  style: { background: "orange", color: "white", fontWeight: 700 },
                });
              }
            }
          } else {
            toast("Microphone unavailable or blocked. Enable it in browser settings.", {
              style: { background: "orange", color: "white", fontWeight: 700 },
            });
          }
        } else {
          // mic mute: keep track in the sender, instant silence
          streamsRef.current.audioStream?.getAudioTracks().forEach((t) => {
            t.enabled = false;
          });
          setMedia((prev) => ({ ...prev, audio: false }));
          setAudio(false);
          audioRef.current = false;
          sendMediaState({ audio: false, video: videoRef.current });
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
      (userCallState.status === "calling" || userCallState.status === "incall") &&
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
    if (userCallState.action === "default" && userCallState.status === "default") {
      if (!guest?.id) {
        toast("Choose a person to call first.", {
          style: { background: "orange", color: "white", fontWeight: 700 },
        });
        return;
      }
      dlog("Initiating call to guest:", guest.id);
      // make sure the connection uses fresh TURN credentials for this call
      await prepareForCall();
      ensureCallerTransceivers();
      await attachCurrentTracks();

      setcallstate({ status: "calling", action: "offerer" });
      sendMediaState({ audio: audioRef.current, video: videoRef.current });
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
      dlog("Receiver answering call from guest:", guest.id);
      // answer FIRST: transceiver slots only exist after the offer is applied
      await createAnswer();
      await attachCurrentTracks();
      sendMediaState({ audio: audioRef.current, video: videoRef.current });
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

  /* Mount semantics: receiver auto-answers (connection established immediately,
     no media required). Camera and mic start OFF for both sides; the user
     enables them via the toggle buttons. Offerer pre-acquires nothing here
     (they clicked the call button via startCall). */
  useEffect(() => {
    const initCall = async () => {
      try {
        if (userCallState.action === "receiver") {
          dlog("Auto-answering incoming call as receiver (no local media grabbed yet)");
          await createAnswer();
          // Both sides start with camera and mic OFF.
          // The user turns them on via the toggle buttons.
          sendMediaState({ audio: false, video: false });
        }
        // offerer popup: no preview grab here either; media is opt-in.
      } catch (err) {
        dlog("initCall error (non-blocking):", err);
      }
    };
    initCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div
        className={`${screenSize === "default"
            ? "defaultvideocontainer"
            : "popupvideocontainer"
          } `}
      >
        <div
          className={`${screenSize === "default"
              ? "defaultlocalstream "
              : " popuplocalstream "
            } bg-slate-700 rounded-md}`}
        >
          {mediaState.videoStream && video && (
            <VideoComponent media={mediaState.videoStream} target="local" u={u} />
          )}
          {!video && (
            <div className="w-full h-full bg-slate-700 rounded-md flex items-center justify-center">
              <Image
                alt="local user"
                unoptimized={true}
                width={96}
                height={96}
                src={u.profile || i2}
                className="w-24 h-24 rounded-full "
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
          className="w-10 h-10 p-2 xl:w-14 xl:h-14 xl:p-4 rounded-full flex items-center justify-center"
          style={{
            backgroundColor:
              userCallState.status === "calling" ||
              userCallState.status === "incall"
                ? "red"
                : "green",
            color: "white",
          }}
        >
          <button onClick={() => startCall()}>
            {userCallState.status === "calling" ||
            userCallState.status === "incall" ? (
              <CallEndRounded />
            ) : (
              <CallOutlined />
            )}
          </button>
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
