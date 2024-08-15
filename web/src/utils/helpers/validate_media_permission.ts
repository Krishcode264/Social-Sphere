import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { useRecoilState, useRecoilValue } from "recoil";
import { peerConnectionState } from "@/store/selectors/pc-selector";

export const useGetUserMediaStream = () => {

  const [{}, setMediaStreamAll] = useRecoilState(mediaStreamState);
const peerConnection = useRecoilValue(peerConnectionState);

  const setDefaultdisabledTracks = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      track.enabled = false;
      peerConnection?.addTrack(track, stream);
    });

    console.log("stream after track.enable=false ", stream.getTracks());
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
      setDefaultdisabledTracks(stream);
    })
    .catch((err) => {
      throw err;
    });
};
