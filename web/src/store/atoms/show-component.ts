"use client";
import { atom } from "recoil";

type ShowComponentState = {
  showCall: boolean;
  showWebrtcComponent:boolean;
  showFrom: boolean;
  showCommentBox:boolean;
  showCallWindow:boolean;
  showmediaPermission:boolean
};
export const showComponentState = atom({
  key: "showComponentstate",
  default: {
    showCall: false,
    showWebrtcConnection: false,
    showform: true,
    showCommentBox: false,
    showCallWindow: false,
    showmediaPermission:false
  },
});


export const showMsgMediaLargeView=atom(
  {
    key:"msg-media-large-view",
    default:{isShow:false}
  }
)