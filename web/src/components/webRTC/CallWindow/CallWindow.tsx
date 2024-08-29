import { CallWindowAtomState } from "@/store/atoms/callWindowStates";
import { showComponentState } from "@/store/atoms/show-component";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import MediaPermission from "../MediaStream/media-permission";
import { userPermissionState } from "@/store/atoms/user-permissions_atom";
import { mediaStreamState } from "@/store/atoms/media-stream-atom";
import { usePC } from "@/context/peerConnectionContext";
import WebrtcConnection from "../webrtc-connection";
import { useSocket } from "@/context/socketContext";
import { guestState } from "@/store/atoms/guest-atom";
import { userBasicInfoState } from "@/store/atoms/user-atom";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
const CallWindow = () => {

  const setShowCompennts = useSetRecoilState(showComponentState);


   

  return (
    <div className="w-[90%] h-[80%] absolute bg-slate-900  border  z-50   rounded-xl mx-auto inset-0 ">
    
 

       <WebrtcConnection/>

       {/* <div className="w-10 h-10 rounded-xl text-white bg-slate-400 flex items-center justify-center">
        <CloseFullscreenRoundedIcon/>
       </div> */}
    </div>
  );
};

export default CallWindow;
