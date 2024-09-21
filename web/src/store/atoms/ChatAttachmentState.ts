import { atom } from "recoil"


export type AttachMediaType={
    type:"image"|"video"|"file",
    src:null|any,
    
}
export type ChatAttachmentsStateType={
    replying:{name:string,mId:string,timestamp:string,content:string},
    media:AttachMediaType[]
}
export const ChatAttachmentsState=atom<ChatAttachmentsStateType>({
    key:"chat attchments",
    default:{
        replying:{name:"",mId:"",content:"" ,timestamp:""},
        media:[]
    }
})