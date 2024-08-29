import React from "react";
import CameraIcon from "@mui/icons-material/Camera";
import MicIcon from "@mui/icons-material/Mic";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userPermissionState } from "@/store/atoms/user-permissions_atom";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { peerConnectionState } from "@/store/selectors/pc-selector";
import { usePC } from "@/context/peerConnectionContext";
const MediaPermission = ({mode,callback}:{mode:string,callback:()=>void}) => {




  return (
    <div className="  bg-slate-800  border py-2 px-3 w-3/5 md:w-1/2 m-auto flex flex-col items-center rounded-xl relative top-40">
      <p className="text-xl text-slate-400">
        we need acces to your {mode}, for that you have to give permission. reset
        permission settings from your browser
      </p>
      <div className="m-auto text-orange-500">
        <CameraIcon sx={{ fontSize: "33px" }} />
        <MicIcon sx={{ fontSize: "33px" }} />
      </div>
      <button className="  text-orange-500" onClick={callback}>
        click here if you have updated the settings
      </button>
    </div>
  );
};

export default MediaPermission;
