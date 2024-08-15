// "use client"
// import { useState } from "react";

// export const usePeerConnection=()=>{

//   const configForPeerconnection = {
//     echoCancellation: true,
//     iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
//   };

//   const [peerConnection] = useState<RTCPeerConnection|null>(()=>{
//       if (typeof window !== 'undefined') {
//             return new RTCPeerConnection(configForPeerconnection);
//        }
//        return null
//     }
//   );
//   return peerConnection
// }