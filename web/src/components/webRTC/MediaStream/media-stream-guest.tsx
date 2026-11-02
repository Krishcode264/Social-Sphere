import React from "react";
import { VideoComponent, AudioComponent } from "./media-stream-component";
import { useRecoilValue } from "recoil";
import { remoteMediaState, remoteStreamState } from "../../../store/atoms/media-stream-atom";
import { guestState } from "@/store/atoms/guest-atom";
import Image from "next/image";
import i2 from "@/images/duf.webp";
import { CallWindowAtomState } from "@/store/atoms/callWindowStates";
import MicOffIcon from "@mui/icons-material/MicOff";

/**
 * Remote peer rendering.
 * The avatar-vs-video decision comes from the `media-state` signaling message
 * (remoteMediaState), NOT from track existence: with pre-negotiated
 * transceivers the remote track exists (muted) even when the peer's camera
 * is off, and replaceTrack(null) leaves a frozen last frame / black video.
 */
const MediaStreamGuest: React.FC = () => {
  const { audio, video, screen } = useRecoilValue(remoteStreamState);
  const remoteMedia = useRecoilValue(remoteMediaState);
  const guest = useRecoilValue(guestState);
  const { screenSize } = useRecoilValue(CallWindowAtomState);

  const hasLiveVideoTrack = !!video && video.getVideoTracks().some((t) => t.readyState === "live" && !t.muted);
  const showVideo = !!video && (remoteMedia.video || hasLiveVideoTrack);

  return (
    <div
      className={`${screenSize === "popout" ? "popupremotestream" : "defaultremotestream"
        } rounded-md relative overflow-hidden`}
    >
      {showVideo ? (
        <VideoComponent media={video} target="remote" u={guest} />
      ) : (
        <div className="bg-slate-700 flex items-center justify-center w-full h-full rounded-md relative">
          <Image
            alt="guest image"
            unoptimized={true}
            width={96}
            height={96}
            src={guest.profile || i2}
            className="w-24 h-24 rounded-full object-cover"
          />
          {!remoteMedia.audio && (
            <div className="absolute bottom-2 left-2 bg-black/60 rounded-full p-2 flex items-center gap-1">
              <MicOffIcon className="text-white text-sm" />
              <span className="text-white text-xs">muted</span>
            </div>
          )}
        </div>
      )}
      {screen && <VideoComponent media={screen} target="remote" u={guest} />}

      {/* remote audio plays here; NOT gated on the video element */}
      <RemoteAudio />
    </div>
  );
};

const RemoteAudio: React.FC = () => {
  const audio = useRecoilValue(remoteStreamState).audio;
  const guest = useRecoilValue(guestState);
  if (!audio) return null;
  return <AudioComponent media={audio} target="remote" u={guest} />;
};

export default MediaStreamGuest;
