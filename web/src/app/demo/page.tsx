"use client";
import { useSocket } from "@/context/socketContext";
import { userBasicInfoState } from "@/store/atoms/user-atom";
import { playSound } from "@/utils/DomMutations/domMutations";
import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

const Page = () => {
  const socket = useSocket();
  //   const sendMessage=()=>{
  // socket?.emit("xxx",{text:"hey got the xxx ebvevnt "})
  //   }
  const demoRef = useRef<null | HTMLDivElement>(null);
  //  const handleScrollDown = (ref:HTMLDivElement|null) => {
  //   if(ref){

  // const divSh=ref.scrollHeight;
  // playSound.play()
  // ref.scrollBy({ top: divSh, behavior: "smooth" });
  //   }

  //  };
  //  const checkServerHeath = async () => {
  //    const res = await axios.get(
  //      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/health`,{
  //       withCredentials:true
  //      }
  //    );
  //    console.log(res);
  //  };

  //useefefct to start conncetd thing with the guest
  const convoStarted = useRef(false);
  const { id } = useRecoilValue(userBasicInfoState);
  //kirsh264 66af9b269534ebbbb98ca839
  //dan      66b44e672eaeb003e2569b71
  const guestId = id === "66af9b269534ebbbb98ca839"? "66b44e672eaeb003e2569b71": "66af9b269534ebbbb98ca839";
  let roomid;
  useEffect(() => {
    if (socket) {
      if (!convoStarted.current) {
        socket.emit("startConvo", { userId: id, guestId });
        console.log("starting conversation , guestId:",guestId)
        convoStarted.current = true;
      }

   socket.on("send",(m)=>{
     console.log("got message from someone ",m)
   });
    }

 
  }, [socket]);

  const send=()=>{
    if(socket){
     socket.emit("send", { userId: id, guestId ,m:"hello from me eheh"});
     console.log("sending message")
    }
  }
  return (
    <div ref={demoRef} className="h-[600px] overflow-y-scroll bg-slate-900">
<button onClick={send} className='bg-red-500 p-2 rounded-xl'>send message</button>
    

      {/* <div className="min-h-[200px] bg-blue-800">
        <button onClick={checkServerHeath}>send req to get cookies </button>
        
      <div className="min-h-[200px] bg-blue-600"></div>
      <div className="min-h-[200px] bg-blue-800"></div>
      <div className="min-h-[200px] bg-blue-600"></div>
      <div className="min-h-[200px] bg-blue-800"></div>
      <div className="min-h-[200px] bg-blue-600"></div>
      <div className="min-h-[200px] bg-blue-900"></div> */}
      {/* <h1>demo page</h1> */}
      {/* <button
        className="bg-red-500 p2"
        onClick={sendMessage}
        disabled={!socket}
      >
        send socket trigger
      </button> */}
    </div>
  );
};

export default Page;
