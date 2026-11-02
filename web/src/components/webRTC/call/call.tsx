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
import { userInfoState } from "@/store/selectors/user-selector";
import { callState } from "@/store/atoms/calling-state";

const Call = () => {
  const [persontoHandshake, setPersontoHandshake] = useRecoilState(guestState);
  const { cleanupCall } = usePC();
  const offerer = useRecoilValue(userInfoState);
  const [offer, setOffer] = useRecoilState(offerState);
  const socket = useSocket();
  const setShowComponent = useSetRecoilState(showComponentState);
  const [callstate, setCall] = useRecoilState(callState);

  const handleAccept = async (): Promise<void> => {
    if (callstate.status === "default" && callstate.action === "default") {
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
    if (persontoHandshake?.id) {
      socket?.emit("end-call", { guest: persontoHandshake, offerer });
    }
    cleanupCall();
    setShowComponent((prev) => ({ ...prev, showCall: false }));
    setPersontoHandshake({ name: "", id: "" });
    setOffer(null);
  };

  return (
    <div className="text-white p-5 absolute  bg-black rounded-lg flex flex-col top-0 right-0 z-50">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">
          {persontoHandshake?.name
            ? `${persontoHandshake.name} is calling you...`
            : "Incoming call..."}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Accept to open call window, enable camera & mic, and answer
        </p>
      </div>

      <div className="flex justify-center items-center gap-4">
        <button
          className="animate-bounce rounded-full bg-green-500 hover:bg-green-600 p-4 transition-all"
          onClick={handleAcceptClick}
          title="Open call window to enable camera & mic and answer"
        >
          <IconBtn icon={CallIcon} br="50%" />
        </button>

        <button
          className="animate-bounce bg-rose-500 hover:bg-rose-600 rounded-full p-4 transition-all"
          onClick={handleReject}
          title="Decline call"
        >
          <IconBtn icon={CallEndIcon} br="50%" />
        </button>
      </div>
    </div>
  );
};

export default Call;
