import { IconBtn } from "../../basic/IconButton";
import React from "react";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { guestState } from "@/store/atoms/guest-atom";
import { peerConnectionState } from "@/store/selectors/pc-selector";
import { offerState } from "@/store/atoms/pc-atom";
import { useContext } from "react";

import { showComponentState } from "@/store/atoms/show-component";
import { useSocket } from "@/context/socketContext";
import { usePC } from "@/context/peerConnectionContext";
import { callState } from "@/store/atoms/calling-state";
const Call = () => {
  
  const [persontoHandshake , setPersontoHandshake] = useRecoilState(guestState);
  const {createAnswer}= usePC()

  const [offer, setOffer] = useRecoilState(offerState);
const socket=useSocket()
  const setShowComponent=useSetRecoilState(showComponentState)
  const [callstate,setCall]=useRecoilState(callState)
    


  const handleAccept = async (): Promise<void> => {
if(callstate.status === "default" && callstate.action==="default"){
     setCall((prev) => ({ status: "default", action: "receiver" }));
     setShowComponent((prev) => ({
       ...prev,
       showCall: false,
       showCallWindow: true,
     }));
}
    
            
  };

  const handleAcceptClick = () => {
    handleAccept().catch((error) => {
      console.error("Error in handleAccept:", error);
    });
  };
  const handleReject = (): void => {
    setShowComponent((prev) => ({ ...prev, showCall: false }));
    setPersontoHandshake({ name: "", id: "" });
    setOffer( null );
  };

  return (
    <div className="text-white p-5 absolute  bg-black rounded-lg flex flex-col top-0 right-0 z-50">
      <div className="mb-6">
        <h1 className="text-xl">
          {persontoHandshake?.name &&
            `${persontoHandshake.name} is calling you...`}
        </h1>
      </div>

      <div className="flex justify-center items-center gap-2">
        <button
          className=" animate-bounce rounded-full bg-green-500 hover:bg-green-800  p-4"
          onClick={handleAcceptClick}
        >
          <IconBtn icon={CallIcon} br="50%" />
        </button>

        <button
          className=" animate-bounce bg-rose-500  hover:bg-rose-800 rounded-full p-4 "
          onClick={handleReject}
        >
          <IconBtn icon={CallEndIcon} br="50%" />
        </button>
      </div>
    </div>
  );
};

export default Call;
