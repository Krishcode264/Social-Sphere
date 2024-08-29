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