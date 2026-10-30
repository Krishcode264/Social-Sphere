"use client";
import { userInfoState } from "@/store/selectors/user-selector";
import { toast } from "sonner";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useSocket } from "./socketContext";
import type { Candidate } from "@/types/types";
import { guestState } from "@/store/atoms/guest-atom";
import { callState, rtcConnectionState } from "@/store/atoms/calling-state";
import { offerState } from "@/store/atoms/pc-atom";
import { showComponentState } from "@/store/atoms/show-component";
import {
  mediaStreamState,
  remoteMediaState,
  remoteStreamState,
} from "@/store/atoms/media-stream-atom";
import {
  getIceServers,
  prefetchIceServers,
  isRelayDebugEnabled,
  iceServersSignature,
  reportSelectedCandidatePair,
} from "@/utils/rtc/iceServers";

const DEBUG_RTC = process.env.NEXT_PUBLIC_DEBUG_RTC !== "false";

/* eslint-disable no-console */
const dlog = (...args: any[]) => {
  if (DEBUG_RTC) console.log("[RTC]", new Date().toISOString(), ...args);
};

export type PeerRole = "offerer" | "receiver";

export type PCContextType = {
  PC: RTCPeerConnection | null;
  createOffer: (opts?: { iceRestart?: boolean }) => Promise<RTCSessionDescriptionInit | undefined>;
  createAnswer: () => Promise<void>;
  createPeerConnection: (role?: PeerRole) => RTCPeerConnection;
  ensureCallerTransceivers: () => void;
  attachLocalTrackToPC: (
    track: MediaStreamTrack | null,
    kind: "audio" | "video"
  ) => Promise<boolean>;
  sendMediaState: (state?: { audio: boolean; video: boolean }) => void;
  cleanupCall: () => void;
  prepareForCall: () => Promise<void>;
};
const PcContext = createContext<PCContextType | null>(null);

export const PcProvider = ({ children }: { children: React.ReactNode }) => {
  const [guest, setGuest] = useRecoilState(guestState);
  const offerer = useRecoilValue(userInfoState);
  const socket = useSocket();
  const [callStates, setCallState] = useRecoilState(callState);
  const setShowComponent = useSetRecoilState(showComponentState);
  const [offer, setOffer] = useRecoilState(offerState);
  const [mediaStreamRecoil, setMedia] = useRecoilState(mediaStreamState);
  const setStream = useSetRecoilState(remoteStreamState);
  const setRemoteMedia = useSetRecoilState(remoteMediaState);
  const setRtcConn = useSetRecoilState(rtcConnectionState);

  // ---- refs (never recreated on re-render) ----
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const pcIceServersSigRef = useRef<string>("");
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const guestRef = useRef(guest);
  const userRef = useRef(offerer);
  const callStateRef = useRef(callStates);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoStreamRef = useRef<MediaStream | null>(null);
  const audioTransceiverRef = useRef<RTCRtpTransceiver | null>(null);
  const videoTransceiverRef = useRef<RTCRtpTransceiver | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const iceCandidateBufferRef = useRef<RTCIceCandidate[]>([]);
  const localMediaStateRef = useRef<{ audio: boolean; video: boolean }>({
    audio: false,
    video: false,
  });
  const makingOfferRef = useRef(false);
  const restartAttemptsRef = useRef(0);
  const disconnectedTimerRef = useRef<number | null>(null);
  const localPreviewRef = useRef<{ audioStream: MediaStream | null; videoStream: MediaStream | null }>({
    audioStream: null,
    videoStream: null,
  });
  const answeringRef = useRef(false);

  /**
   * Push a brand-new MediaStream wrapper (same tracks) into Recoil so React
   * sees a changed reference and re-renders. This is the core fix for the
   * "avatar disappears but video never appears" bug:
   *   - ontrack fires once (with the muted pre-negotiated track)
   *   - When the remote peer enables their camera mid-call, the browser fires
   *     `onunmute` — NOT a new ontrack. The stream object is identical so
   *     Recoil skips the update, VideoComponent never mounts, srcObject is
   *     never assigned → black / empty tile.
   *   - Swapping in a fresh MediaStream instance forces the re-render.
   */
  const refreshRemoteStream = (kind: "audio" | "video") => {
    const ref = kind === "video" ? remoteVideoStreamRef : remoteAudioStreamRef;
    const existing = ref.current;
    if (!existing) return;
    const fresh = new MediaStream(existing.getTracks());
    ref.current = fresh;
    setStream((prev) => ({ ...prev, [kind]: fresh }));
    dlog(`refreshRemoteStream: new ${kind} stream wrapper pushed to Recoil`);
  };

  useEffect(() => {
    guestRef.current = guest;
  }, [guest]);
  useEffect(() => {
    userRef.current = offerer;
  }, [offerer]);
  useEffect(() => {
    callStateRef.current = callStates;
  }, [callStates]);
  useEffect(() => {
    localPreviewRef.current = {
      audioStream: mediaStreamRecoil.audioStream,
      videoStream: mediaStreamRecoil.videoStream,
    };
  }, [mediaStreamRecoil]);

  const getOrCreateLocalStream = () => {
    if (!localStreamRef.current) localStreamRef.current = new MediaStream();
    return localStreamRef.current;
  };

  /**
   * Fetch short-lived TURN credentials from our backend once on app load
   * (falls back to STUN-only if the endpoint is missing or fails), then
   * create the initial peer connection with the loaded servers so the
   * very first call never has to wait for a slow backend wake-up.
   */
  useEffect(() => {
    let cancelled = false;
    if (typeof window === "undefined") return;
    prefetchIceServers();
    (async () => {
      try {
        const servers = await getIceServers();
        if (cancelled) return;
        iceServersRef.current = servers;
        dlog("prefetched iceServers:", iceServersSignature(servers));
      } catch {
      } finally {
        if (!cancelled && !peerRef.current) createPeerConnection();
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logTransceivers = (peer: RTCPeerConnection, label: string) => {
    if (!DEBUG_RTC || !peer) return;
    peer.getTransceivers().forEach((t) => {
      dlog(
        `${label} transceiver`,
        JSON.stringify({
          mid: t.mid,
          kind: t.receiver.track?.kind,
          direction: t.direction,
          currentDirection: t.currentDirection,
        })
      );
    });
  };

  /**
   * Caller-only: pre-allocate audio + video transceivers (sendrecv) so that
   * tracks can be added/remplacer via replaceTrack later with NO renegotiation.
   * Receiver gets its transceivers from the received offer instead (see createAnswer).
   */
  const ensureCallerTransceivers = () => {
    const peer = peerRef.current;
    if (!peer) return;
    if (peer.getTransceivers().length >= 2) return;
    const ls = getOrCreateLocalStream();
    const audioT = peer.addTransceiver("audio", { direction: "sendrecv", streams: [ls] });
    const videoT = peer.addTransceiver("video", { direction: "sendrecv", streams: [ls] });
    audioTransceiverRef.current = audioT;
    videoTransceiverRef.current = videoT;
    dlog("caller transceivers pre-allocated (audio, video, sendrecv)");
  };

  /**
   * PC-level event handlers are attached here, synchronously at construction,
   * so they are guaranteed to be live before any offer/candidates flow.
   * They read live state via refs, never stale closures.
   */
  const wirePeerHandlers = (newPC: RTCPeerConnection) => {
    // NOTE: no onnegotiationneeded handler on purpose (guide 13.6).
    // Transceivers are pre-negotiated; only ICE restart offers are created,
    // and those are triggered explicitly via createOffer({ iceRestart: true }).

    newPC.onicecandidate = (event) => {
      if (event.candidate) {
        if (guestRef.current?.id) {
          socket?.emit("ice-candidate", {
            candidate: event.candidate,
            guest: guestRef.current,
            offerer: userRef.current,
          });
        }
        iceCandidateBufferRef.current.push(event.candidate);
      }
    };

    newPC.onicegatheringstatechange = () => {
      dlog("iceGatheringState", newPC.iceGatheringState);
    };

    newPC.ontrack = (e: RTCTrackEvent) => {
      const kind = e.track.kind as "audio" | "video";
      dlog("ontrack", kind, "readyState:", e.track.readyState, "muted:", e.track.muted, "streams.length =", e.streams?.length);
      const ref = kind === "video" ? remoteVideoStreamRef : remoteAudioStreamRef;
      let stream = ref.current;
      if (!stream) {
        stream = new MediaStream();
        ref.current = stream;
      }
      if (!stream.getTracks().includes(e.track)) {
        stream.addTrack(e.track);
      }
      // Publish the stream immediately so audio element can attach.
      // Video display is gated by remoteMedia.video (media-state signal).
      setStream((prev) => ({ ...prev, [kind]: stream }));

      /**
       * KEY FIX: mid-call camera/mic enable fires `onunmute` on the EXISTING
       * track object, not a new `ontrack`. The stream ref is the same object
       * so Recoil won't re-render. We swap in a fresh MediaStream wrapper so
       * React remounts VideoComponent and assigns srcObject → live video.
       */
      e.track.onunmute = () => {
        dlog("remote track unmuted:", kind, "- refreshing stream ref");
        refreshRemoteStream(kind);
      };

      e.track.onmute = () => {
        // Don't clear the stream; media-state signal is the UI truth.
        dlog("remote track muted:", kind);
      };

      e.track.onended = () => {
        dlog("remote track ended:", kind);
        // Track is dead; clear the ref so a stale track doesn't linger.
        ref.current = null;
        setStream((prev) => ({ ...prev, [kind]: null }));
      };
    };

    const logSelectedPair = async () => {
      try {
        const stats = await newPC.getStats();
        pair: for (const report of stats.values() as any) {
          if (
            report?.type === "candidate-pair" &&
            report.state === "succeeded" &&
            (report.nominated || report.selected)
          ) {
            const local = stats.get(report.localCandidateId) as any;
            const remote = stats.get(report.remoteCandidateId) as any;
            reportSelectedCandidatePair(local?.candidateType ?? null, remote?.candidateType ?? null);
            break pair;
          }
        }
      } catch {}
    };

    newPC.onconnectionstatechange = () => {
      dlog("connectionState", newPC.connectionState, "signalingState", newPC.signalingState);
      if (newPC.connectionState === "connected") {
        setRtcConn({ status: "connected" });
        void logSelectedPair();
        sendMediaState();
      } else if (newPC.connectionState === "failed" || newPC.connectionState === "disconnected") {
        setRtcConn({ status: "reconnecting" });
      } else if (newPC.connectionState === "closed") {
        setRtcConn({ status: "default" });
      }
    };

    newPC.oniceconnectionstatechange = () => {
      const state = newPC.iceConnectionState;
      dlog("iceConnectionState", state, "signalingState", newPC.signalingState);
      if (state === "connected" || state === "completed") {
        clearDisconnectedTimer();
        if (newPC.connectionState !== "disconnected") setRtcConn({ status: "connected" });
        sendMediaState();
      } else if (state === "disconnected") {
        setRtcConn({ status: "reconnecting" });
        clearDisconnectedTimer();
        // often self-heals; only restart after a grace period
        disconnectedTimerRef.current = window.setTimeout(() => {
          if (
            newPC.iceConnectionState === "disconnected" ||
            newPC.iceConnectionState === "failed"
          ) {
            triggerIceRestart();
          }
        }, 4000);
      } else if (state === "failed") {
        setRtcConn({ status: "reconnecting" });
        clearDisconnectedTimer();
        triggerIceRestart();
      }
    };
  };

  const createPeerConnectionInstance = (role?: PeerRole) => {
    const relayOnly = isRelayDebugEnabled();
    if (relayOnly) dlog("WARNING: force-relay debug mode ON (NEXT_PUBLIC_RTC_FORCE_RELAY / ?forceRelay)");
    const newPC = new RTCPeerConnection({
      iceServers: iceServersRef.current,
      iceCandidatePoolSize: 10,
      ...(relayOnly ? { iceTransportPolicy: "relay" as RTCIceTransportPolicy } : {}),
    });
    pcIceServersSigRef.current = iceServersSignature(iceServersRef.current);
    peerRef.current = newPC;
    // NOTE: pendingCandidatesRef is intentionally NOT reset here: candidates
    // queued while the callee was ringing must survive a recreation at accept.
    iceCandidateBufferRef.current = [];
    audioTransceiverRef.current = null;
    videoTransceiverRef.current = null;
    restartAttemptsRef.current = 0;
    wirePeerHandlers(newPC);
    if (role === "offerer") {
      ensureCallerTransceivers();
    }
    dlog("peer connection created", "iceServers:", pcIceServersSigRef.current);
    return newPC;
  };

  const [PC, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const createPeerConnection = (role?: PeerRole) => {
    const newPeerConnection = createPeerConnectionInstance(role);
    setPeerConnection(newPeerConnection);
    return newPeerConnection;
  };

  const flushPendingCandidates = async (peer: RTCPeerConnection) => {
    while (pendingCandidatesRef.current.length > 0) {
      const cand = pendingCandidatesRef.current.shift();
      if (cand) {
        try {
          dlog("applying queued ICE candidate", cand.sdpMid);
          await peer.addIceCandidate(cand);
        } catch (err) {
          console.error("[RTC] Error adding queued candidate:", err);
        }
      }
    }
  };

  const addCandidateSafely = async (peer: RTCPeerConnection | null, candidate: RTCIceCandidateInit) => {
    if (!peer) return;
    try {
      if (peer.remoteDescription && peer.remoteDescription.type) {
        await peer.addIceCandidate(candidate);
        dlog("ICE candidate applied", candidate.sdpMid, candidate.sdpMLineIndex);
      } else {
        pendingCandidatesRef.current.push(candidate);
        dlog("ICE candidate queued (no remote description yet)");
      }
    } catch (err) {
      console.error("[RTC] Error in addCandidateSafely:", err);
    }
  };

  /**
   * Attach a local track to the pre-negotiated transceiver slot (replaceTrack).
   * Uses stored transceiver refs; falls back to a kind lookup if not stored yet.
   * NEVER calls pc.addTrack (that would force renegotiation).
   */
  const attachLocalTrackToPC = async (
    track: MediaStreamTrack | null,
    kind: "audio" | "video"
  ): Promise<boolean> => {
    const peer = peerRef.current;
    if (!peer) {
      dlog("attachLocalTrackToPC: no peer connection");
      return false;
    }
    try {
      const ref = kind === "audio" ? audioTransceiverRef : videoTransceiverRef;
      let transceiver = ref.current;
      if (!transceiver || transceiver.mid == null) {
        transceiver = peer.getTransceivers().find((t) => t.receiver.track.kind === kind) ?? null;
        if (transceiver) ref.current = transceiver;
      }

      if (transceiver && transceiver.sender) {
        await transceiver.sender.replaceTrack(track);
        if (track) {
          const ls = getOrCreateLocalStream();
          if (!ls.getTracks().includes(track)) ls.addTrack(track);
        }
        dlog(
          `replaceTrack OK on mid=${transceiver.mid} (${kind})`,
          track ? `track=${track.id}` : "null (off)"
        );
        return true;
      }

      dlog(`No transceiver slot for ${kind} - track NOT attached`);
      return false;
    } catch (err) {
      console.error(`[RTC] Failed to attach track for ${kind}:`, err);
      return false;
    }
  };

  /**
   * Explicit UI-state signaling: tells the remote peer whether our mic/camera
   * are ON. Sent on every change AND right after the connection is up AND on
   * socket reconnect.
   */
  const sendMediaState = (state?: { audio: boolean; video: boolean }) => {
    if (state) localMediaStateRef.current = { ...state };
    const g = guestRef.current;
    if (g?.id && socket) {
      socket.emit("media-state", { ...localMediaStateRef.current, guest: g, offerer: userRef.current });
      dlog("media-state sent", JSON.stringify(localMediaStateRef.current), "to", g.id);
    }
  };

  const clearDisconnectedTimer = () => {
    if (disconnectedTimerRef.current != null) {
      window.clearTimeout(disconnectedTimerRef.current);
      disconnectedTimerRef.current = null;
    }
  };

  const triggerIceRestart = async () => {
    if (callStateRef.current.action !== "offerer") {
      dlog("ICE restart requested by non-offerer - waiting for offerer to restart");
      return;
    }
    if (restartAttemptsRef.current >= 3) {
      toast("Connection lost. Please try calling again.", {
        style: { background: "red", color: "white", fontWeight: 700 },
      });
      cleanupCall();
      return;
    }
    restartAttemptsRef.current += 1;
    dlog("ICE restart attempt", restartAttemptsRef.current);
    try {
      await createOffer({ iceRestart: true });
    } catch (err) {
      console.error("[RTC] ICE restart offer failed:", err);
    }
  };

  /**
   * Full teardown used by EVERY end path: remote hangup, local hangup,
   * cancel-while-ringing, reject, socket loss, ICE failure, unmount.
   */
  const cleanupCall = () => {
    dlog("cleanupCall");
    const peer = peerRef.current;

    clearDisconnectedTimer();

    // stop local preview media
    if (localPreviewRef.current.audioStream) {
      localPreviewRef.current.audioStream.getTracks().forEach((t) => t.stop());
    }
    if (localPreviewRef.current.videoStream) {
      localPreviewRef.current.videoStream.getTracks().forEach((t) => t.stop());
    }
    localPreviewRef.current = { audioStream: null, videoStream: null };

    if (peer) {
      try {
        peer.getSenders().forEach((s) => {
          if (s.track) s.replaceTrack(null);
        });
      } catch {}
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onnegotiationneeded = null;
      peer.oniceconnectionstatechange = null;
      peer.onconnectionstatechange = null;
      peer.onicegatheringstatechange = null;
      try {
        peer.close();
      } catch {}
    }

    // reset refs
    audioTransceiverRef.current = null;
    videoTransceiverRef.current = null;
    pendingCandidatesRef.current = [];
    iceCandidateBufferRef.current = [];
    remoteAudioStreamRef.current = null;
    remoteVideoStreamRef.current = null;
    localMediaStateRef.current = { audio: false, video: false };
    makingOfferRef.current = false;
    restartAttemptsRef.current = 0;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // reset Recoil / UI state
    setStream({ audio: null, video: null, screen: null });
    setRemoteMedia({ audio: false, video: false });
    setMedia({ audioStream: null, videoStream: null, video: false, audio: false });
    setRtcConn({ status: "default" });

    // fresh bare peer connection for the next call
    createPeerConnection();
  };

  const createOffer = async (opts?: { iceRestart?: boolean }) => {
    try {
      const targetGuest = guestRef.current?.id ? guestRef.current : guest;
      if (!targetGuest?.id) {
        dlog("No guest ID to create offer for");
        return undefined;
      }
      const peer = peerRef.current;
      if (!peer) return undefined;
      makingOfferRef.current = true;
      const createdOffer = await peer.createOffer(
        opts?.iceRestart ? { iceRestart: true } : undefined
      );
      await peer.setLocalDescription(createdOffer);
      dlog("offer created (iceRestart:", !!opts?.iceRestart, ") emitting to", targetGuest.id);
      logTransceivers(peer, "after offer creation");
      socket?.emit("offer", { offer: createdOffer, guest: targetGuest, offerer: userRef.current });
      sendMediaState();
      return createdOffer;
    } catch (error) {
      console.error("[RTC] Error creating offer:", error);
      return undefined;
    } finally {
      makingOfferRef.current = false;
    }
  };

  /**
   * Call-start gate (caller AND callee): make sure the iceServers config is
   * current; if it changed since the active peer connection was built (e.g.
   * TURN credentials only became available after the app loaded), rebuild
   * the bare connection. Never rebuilds once signaling/ICE is in progress.
   */
  const prepareForCall = async () => {
    try {
      const servers = await getIceServers();
      iceServersRef.current = servers;
      const sig = iceServersSignature(servers);
      const peer = peerRef.current;
      const recreate = !peer || (sig !== pcIceServersSigRef.current);
      if (recreate && (!peer || (peer.signalingState === "stable" && !peer.remoteDescription && peer.connectionState !== "connected"))) {
        dlog("iceServers config changed -> rebuilding peer connection before the call");
        createPeerConnection();
      }
    } catch (err) {
      dlog("prepareForCall iceServers refresh failed (continuing):", err);
    }
  };

  /**
   * Callee: build the answer from the received offer.
   * The offer's m-lines create our transceivers; we MUST flip their
   * direction from the default "recvonly" to "sendrecv" so we can send
   * later without renegotiation. We also store the refs by kind so
   * attachLocalTrackToPC finds the right slots.
   */
  const createAnswer = async () => {
    let peer = peerRef.current;
    if (!offer || !peer || answeringRef.current) return;
    answeringRef.current = true;
    if (peer.remoteDescription) {
      dlog("createAnswer skipped - remote description already set (idempotent)");
      answeringRef.current = false;
      return;
    }
    try {
      // make sure the connection was built with up-to-date TURN credentials
      await prepareForCall();
      peer = peerRef.current;
      if (!peer) {
        dlog("createAnswer: no peer connection after prepare");
        return;
      }
      makingOfferRef.current = true;
      await peer.setRemoteDescription(offer);
      dlog("remote description set (offer); signalingState =", peer.signalingState);
      await flushPendingCandidates(peer);

      // Flip all m-line transceivers to sendrecv so local tracks can be
      // injected later (via replaceTrack) without any renegotiation.
      peer.getTransceivers().forEach((t) => {
        const kind = t.receiver.track.kind;
        if (kind === "audio" || kind === "video") {
          t.direction = "sendrecv";
          try {
            (t.sender as any).setStreams?.([getOrCreateLocalStream()]);
          } catch {}
          if (kind === "audio") audioTransceiverRef.current = t;
          else videoTransceiverRef.current = t;
        }
      });
      logTransceivers(peer, "after transceiver setup (expect 2, all sendrecv)");

      const createdAnswer = await peer.createAnswer();
      await peer.setLocalDescription(createdAnswer);
      logTransceivers(peer, "after setLocalDescription (answer)");
      socket?.emit("answer", {
        answer: createdAnswer,
        guest: guestRef.current,
        offerer: userRef.current,
      });
      setCallState(() => ({ status: "incall", action: "receiver" }));
      // NOTE: we do NOT grab local media here. That is the UI layer's job
      // (media-stream.tsx → initCall). Mixing getUserMedia into signaling
      // caused a race where prepareForCall could rebuild the PC *after*
      // transceivers were stored, invalidating audioTransceiverRef /
      // videoTransceiverRef and making all subsequent attachLocalTrackToPC
      // calls silently fail.
      sendMediaState();
    } catch (error) {
      console.error("[RTC] Error creating answer:", error);
    } finally {
      makingOfferRef.current = false;
      answeringRef.current = false;
    }
  };

  useEffect(() => {
    if (!socket) return;
    // PC-level events (onicecandidate/ontrack/connection/ice state) are wired
    // synchronously inside createPeerConnectionInstance() -> wirePeerHandlers.

    // ---- socket events (handlers reference refs, not stale closures) ----

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (candidate) {
        await addCandidateSafely(peerRef.current, candidate);
      }
    };

    const handleGuestCandidate = async ({ iceCandidateBuffer: receivedCandidates }: Candidate) => {
      if (Array.isArray(receivedCandidates)) {
        for (const cand of receivedCandidates) {
          await addCandidateSafely(peerRef.current, cand);
        }
      }
    };

    const handleCandidate = async ({ iceCandidateBuffer: receivedCandidates }: Candidate) => {
      if (Array.isArray(receivedCandidates)) {
        for (const cand of receivedCandidates) {
          await addCandidateSafely(peerRef.current, cand);
        }
      }
    };

    const handleAnswer = async (data: any) => {
      const peer = peerRef.current;
      if (guestRef.current?.id === data.offerer?.id && peer) {
        dlog("answer received from", data.offerer?.id);
        await peer.setRemoteDescription(data.answer);
        await flushPendingCandidates(peer);
        clearDisconnectedTimer();
        restartAttemptsRef.current = 0;
        setRtcConn({ status: "connected" });
        setCallState((prev) => ({ ...prev, status: "incall" }));
        if (iceCandidateBufferRef.current.length > 0 && guestRef.current?.id) {
          socket.emit("candidate", {
            iceCandidateBuffer: iceCandidateBufferRef.current,
            guest: guestRef.current,
            offerer: userRef.current,
          });
          iceCandidateBufferRef.current = [];
        }
        logTransceivers(peer, "caller after answer applied");
      }
    };

    const handleOffer = async (data: any) => {
      const peer = peerRef.current;
      dlog("offer received from:", data.offerer?.id, "peer exists:", !!peer);
      const offerUserId = data.offerer?.id;
      const samePeerCall =
        callStateRef.current.status !== "default" &&
        !!guestRef.current?.id &&
        guestRef.current.id === offerUserId;

      if (samePeerCall && peer) {
        // Renegotiation / ICE-restart offer from the peer we are in a call
        // with -> perfect negotiation: impolite (offerer) ignores on collision.
        const polite = callStateRef.current.action === "receiver";
        const offerCollision = makingOfferRef.current || peer.signalingState !== "stable";
        if (offerCollision && !polite) {
          dlog("offer collision: impolite peer ignoring offer");
          return;
        }
        try {
          makingOfferRef.current = true;
          await peer.setRemoteDescription(data.offer); // implicit rollback when polite
          dlog("renegotiation offer applied; signalingState", peer.signalingState);
          await flushPendingCandidates(peer);
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer", {
            answer,
            guest: data.offerer,
            offerer: userRef.current,
          });
        } catch (err) {
          console.error("[RTC] Error handling renegotiation offer:", err);
        } finally {
          makingOfferRef.current = false;
        }
        return;
      }

      if (
        callStateRef.current.status === "calling" ||
        callStateRef.current.status === "incall" ||
        peer?.remoteDescription
      ) {
        dlog("user is busy");
        socket.emit("busy", data);
        return;
      }

      // fresh incoming call: store offer, ring the UI (requires NO permission)
      dlog("incoming call offer from:", data.offerer);
      setOffer(data.offer);
      setGuest(data.offerer);
      setShowComponent((prev) => ({
        ...prev,
        showCall: true,
      }));
    };

    const handleMediaState = (data: { audio: boolean; video: boolean; offerer: any }) => {
      if (guestRef.current?.id && data.offerer?.id === guestRef.current.id) {
        dlog("media-state received", JSON.stringify({ audio: data.audio, video: data.video }));
        setRemoteMedia({ audio: !!data.audio, video: !!data.video });
        // Backup path: if onunmute already fired before this message arrived,
        // or if the browser didn't fire onunmute at all (some Chromium builds),
        // refresh the stream wrapper now so VideoComponent definitely mounts.
        if (data.video && remoteVideoStreamRef.current) {
          refreshRemoteStream("video");
        }
        if (data.audio && remoteAudioStreamRef.current) {
          refreshRemoteStream("audio");
        }
      }
    };

    const handleUserBusy = ({ guest: busyGuest }: { guest: any }) => {
      dlog("User is busy:", busyGuest?.name);
      toast(`${busyGuest?.name || "User"} is busy with another call.`, {
        style: { background: "orange", color: "white", fontWeight: 700 },
      });
    };

    const handleCallEnded = ({ by }: { by: any }) => {
      dlog("call ended by:", by?.name);
      const wasRejected = callStateRef.current.status === "calling";
      toast(
        wasRejected ? `${by?.name || "User"} rejected the call.` : `${by?.name || "User"} ended the call.`,
        {
          style: { background: "red", color: "white", fontWeight: 700 },
        }
      );
      setCallState({ status: "default", action: "default" });
      setGuest({ id: "", name: "" });
      setOffer(null);
      setShowComponent((prev) => ({ ...prev, showCallWindow: false, showCall: false }));
      cleanupCall();
    };

    const notifyPeerOnUnload = () => {
      if (guestRef.current?.id && callStateRef.current.status !== "default") {
        socket.emit("end-call", { guest: guestRef.current, offerer: userRef.current });
      }
    };

    const handleReconnect = () => {
      // re-send media-state so the remote UI is correct after a socket drop
      if (guestRef.current?.id && callStateRef.current.status !== "default") {
        sendMediaState();
      }
    };

    socket.on("ice-candidate", handleIceCandidate);
    socket.on("guest-candidate", handleGuestCandidate);
    socket.on("candidate", handleCandidate);
    socket.on("answer", handleAnswer);
    socket.on("offer", handleOffer);
    socket.on("media-state", handleMediaState);
    socket.on("user-busy", handleUserBusy);
    socket.on("call-ended", handleCallEnded);
    socket.on("connect", handleReconnect);
    window.addEventListener("pagehide", notifyPeerOnUnload);
    window.addEventListener("beforeunload", notifyPeerOnUnload);

    return () => {
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("guest-candidate", handleGuestCandidate);
      socket.off("candidate", handleCandidate);
      socket.off("answer", handleAnswer);
      socket.off("offer", handleOffer);
      socket.off("media-state", handleMediaState);
      socket.off("user-busy", handleUserBusy);
      socket.off("call-ended", handleCallEnded);
      socket.off("connect", handleReconnect);
      window.removeEventListener("pagehide", notifyPeerOnUnload);
      window.removeEventListener("beforeunload", notifyPeerOnUnload);
      clearDisconnectedTimer();
    };
    // deps intentionally narrow: handlers read live values via refs so
    // re-running the effect on every state change would churn listeners
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <PcContext.Provider
      value={{
        PC,
        createOffer,
        createAnswer,
        createPeerConnection,
        ensureCallerTransceivers,
        attachLocalTrackToPC,
        sendMediaState,
        cleanupCall,
        prepareForCall,
      }}
    >
      {children}
    </PcContext.Provider>
  );
};

export const usePC = (): PCContextType => {
  const pc = useContext(PcContext);
  if (!pc) {
    throw new Error("usePC must be used within PcProvider");
  }
  return pc;
};
