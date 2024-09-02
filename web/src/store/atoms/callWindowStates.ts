import { atom } from "recoil";
export type CallWindowAtomStateType={
 mode:string,
 screenSize:"default"|"popout"
}
export const CallWindowAtomState=atom<CallWindowAtomStateType>({
    key:"call-window-atom",
    default:{
        mode:"",
        screenSize:"default"
    }
})