"use client";
import { atom } from "recoil";

type ShowComponentState = {
  showCall: boolean;
  showWebrtcComponent:boolean;
  showFrom: boolean;
  showCommentBox:boolean;
};
export const showComponentState = atom({
  key: "showComponentstate",
  default: {
    showCall:false,
    showWebrtcConnection:false,
    showform:true,
    showCommentBox:false,
    
  }
});
