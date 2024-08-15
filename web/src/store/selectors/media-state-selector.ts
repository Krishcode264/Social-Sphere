
import { DefaultValue, selector } from "recoil";
import { mediaStreamState } from "../atoms/media-stream-atom";

export const mediaState = selector<
  { audio: boolean; video: boolean } | DefaultValue
>({
  key: "mediaState",
  get: ({ get }) => {
    const { video, audio } = get(mediaStreamState);
    return { video, audio };
  },
  set: ({ set }, media) => {
    if (media instanceof DefaultValue) {
      return;
    }

    set(mediaState, (prev) => ({
      ...prev,
      video: media.video,
      audio: media.audio,
    }));
  },
});

export const remoteStreamState = selector<DefaultValue | MediaStream | null>({
  key: "remote-stream-selector",
  get: ({ get }) => {
    const { remoteStream } = get(mediaStreamState);
    return remoteStream;
  },
  set: ({ set }, newRemoteStreat) => {
    if (newRemoteStreat instanceof DefaultValue) {
      return;
    }

    set(mediaStreamState, (prev) => ({
      ...prev,
      remoteStream: newRemoteStreat,
    }));
  },
});


