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
import { PC } from "@/utils/PC";
const Call = () => {
  
  const [{ persontoHandshake }, setPersontoHandshake] = useRecoilState(guestState);
  const peerConnection = usePC()
    const pc: PC | null = peerConnection ? new PC(peerConnection) : null;
  const [{offer}, setOffer] = useRecoilState(offerState);
const socket=useSocket()
  const setShowComponent=useSetRecoilState(showComponentState)

    


  const handleAccept = async (): Promise<void> => {
    setShowComponent((prev)=>({...prev,showCall:false}))
    if (offer) {
      await new Promise<void>((resolve, reject) => {
        peerConnection
          ?.setRemoteDescription(offer)
          .then(async () => {
            const answer = await pc?.createAnswer();
          //  console.log(answer,"answer from handle accesspt")
            socket?.emit("getCreateAnswerFromRequestedUser", {
              answer,
              receivedUser: persontoHandshake,
            });

            resolve(); 
          })
          .catch((error) => {
            reject(error); 
          });
      });

      try {
        peerConnection?.setRemoteDescription(offer);
        const answer = await pc?.createAnswer();
        socket?.emit("getCreateAnswerFromRequestedUser", {
          answer,
          receivedUser: persontoHandshake,
        });
        console.log(
          "created  and sent sdp answer after getting offer  , both local and remote : done "
        );
      } catch (err) {
        console.log(err, "error in accepting call");
      }
    }
  };

  const handleAcceptClick = () => {
    handleAccept().catch((error) => {
      console.error("Error in handleAccept:", error);
    });
  };
  const handleReject = (): void => {
    setShowComponent((prev) => ({ ...prev, showCall: false }));
    setPersontoHandshake({ persontoHandshake: { name: "", id: "" } });
    setOffer({ offer: null });
  };

  return (
    <div className="text-white p-5 absolute  bg-black rounded-lg flex flex-col">
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
