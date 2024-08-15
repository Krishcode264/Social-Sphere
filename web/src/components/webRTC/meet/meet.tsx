// "use client";
import { User } from "@/types/types";
// import React, { useEffect } from "react";
// import WebrtcConnection from "../webrtc-connection";
// import RenderConnectedUsers from "../user-detail";
// import Call from "../call/call";
// import { useRecoilState, useRecoilValue} from "recoil";
// import { guestState } from "@/store/atoms/guest-atom";
// import { userInfoState } from "@/store/selectors/user-selector";
// import { connectedUsersState } from "@/store/atoms/socket-atom";
// import { showComponentState } from "@/store/atoms/show-component";
// import { useMediaPermissionAccess } from "../../../hooks/useMediaPermissionAccess";
// import { useSocket } from "@/context/socketContext";
// import { usePC } from "@/context/peerConnectionContext";

export interface OfferSdp {
  sdp?: string;
  type: "offer";
}
export type ConnectedUsers = User[] | [];
// export function Meet() {
//   const user = useRecoilValue(userInfoState);
//   const [{ persontoHandshake }] = useRecoilState(guestState);
//   const [{ connectedUsers }] = useRecoilState(connectedUsersState);
//   const [showComponent] = useRecoilState(showComponentState);
//   const { showCall } = showComponent;
//   const socket = useSocket();
//   const peerConnection = usePC();

//   useMediaPermissionAccess();

//   //ice candidate exchnage
//   if (peerConnection) {
//     peerConnection.onicecandidate = (event) => {
//       // console.log("onicecandidate event is running");
//       if (peerConnection.remoteDescription) {
//         // console.log("actul ice candidates shared now ");
//         if (event.candidate && socket !== null) {
//           const candidate = event.candidate;
//           socket.emit("candidate", { candidate, persontoHandshake, user });
//           console.log("candidate  sent ");
//         }
//       }
//     };
//   }

//   return (
//     <div className=" w-full">
     
//     </div>
//   );
// }
