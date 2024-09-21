import { CallWindowAtomState } from "@/store/atoms/callWindowStates";
import { showComponentState } from "@/store/atoms/show-component";
import { useCallback, useEffect, useRef, useState, type MouseEventHandler } from "react";
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
import ZoomInMapOutlinedIcon from "@mui/icons-material/ZoomInMapOutlined";
import ZoomOutMapOutlinedIcon from "@mui/icons-material/ZoomOutMapOutlined";
import "./callwindow.css"

const CallWindow = () => {
  const setShowCompennts = useSetRecoilState(showComponentState);
  const { screenSize } = useRecoilValue(CallWindowAtomState);
  console.log(screenSize);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const popupRef = useRef<null | HTMLDivElement>(null);
   const {createPeerConnection}=usePC()
  const startDragging = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (screenSize === "default") return;
    setIsDragging(true);
    console.log("on mousedown  running");
    console.log("e.clientx ", e.clientX, "e.client Y", e.clientY);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const onDrag = useCallback(
    (e:MouseEvent) => {
      if (isDragging && popupRef.current) {
        const popupWidth = popupRef.current.offsetWidth;
        const popupHeight = popupRef.current.offsetHeight;
        console.log(popupHeight, popupWidth);
        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;
        popupRef.current.style.cursor = "move";
        // Prevent popup from going outside the window boundaries
        const maxX = window.innerWidth - popupWidth-165;
        const maxY = window.innerHeight - popupHeight-18;

        // console.log(popupWidth, "width popup", popupHeight, "popup  height");
        //  console.log(maxX,"max x ",maxY,"max y")
        //  console.log(newX,"new x ",newY,"ney y")
        // console.log(
        //   window.innerWidth,
        //   "w-innerwidth",
        //   window.innerHeight,
        //   "w inner height"
        // );
        setPosition({
          x: Math.min(maxX,newX),
          y: Math.min(maxY,newY)
        });
        // setPosition({
        //   x: newX,
        //   y: newY,
        // });
      }
    },
    [isDragging, offset]
  );

  const stopDragging = () => {
    //       console.log("on mouseleave or onmouse up running");
    if(popupRef.current){
 popupRef.current.style.cursor = "pointer";
    }
         
    setIsDragging(false);
  };
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", stopDragging);
    } else {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDragging);
    }

    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging, onDrag]);


useEffect(()=>{
  setPosition(()=>({x:0,y:0}))
},[screenSize])



  return (
    <div
      ref={popupRef}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={startDragging}
      className={` ${
        screenSize === "popout" ? "popup" : "default"
      } " w-full  h-full md:h-[90%] absolute bg-slate-900  border  z-50   rounded-xl  inset-0 `}
    >
      <WebrtcConnection />

    </div>
  );
};

export default CallWindow;
