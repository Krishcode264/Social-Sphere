import { pcState } from "../atoms/pc-atom";
import { selector } from "recoil";

export const peerConnectionState = selector({
  key: "pcState",
  get: ({ get }) => {
    const {peerConnection } = get(pcState);
    return peerConnection;
  },
});
