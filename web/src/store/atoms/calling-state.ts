import recoil from 'recoil'
import {atom} from "recoil"
export type CallStateProps={status:"default"|"calling"|"incall"|"rejected",
    action:"default"|"receiver"|"offerer"
}
export const callState=atom<CallStateProps>({
    key:"call-state",
    default:{
        status:"default",
        action:"default"
    }
})

export type RtcConnectionStatusProps = {
  status: "default" | "connected" | "reconnecting";
};

export const rtcConnectionState = atom<RtcConnectionStatusProps>({
  key: "rtc-connection-state",
  default: { status: "default" },
});