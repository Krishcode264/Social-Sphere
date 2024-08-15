import recoil from 'recoil'
import {atom} from "recoil"
export type CallStateProps="default"|"calling"|"incall"|"rejected";
export const callState=atom<CallStateProps>({
    key:"call-state",
    default:'default'
})