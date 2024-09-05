"use client"
import Loading from "@/components/basic/loading";
import AuthNav from "@/components/profile/auth_nav";
import { useAuthContext } from "@/context/authContext";

import React, { useEffect }  from "react";
  import { usePathname } from "next/navigation";
import { useRecoilValue } from "recoil";
import { userInfoState } from "@/store/selectors/user-selector";
import { showComponentState } from "@/store/atoms/show-component";
import CallWindow from "@/components/webRTC/CallWindow/CallWindow";
import Call from "@/components/webRTC/call/call";
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isValid } = useAuthContext();
   const {showCallWindow,showCall}=useRecoilValue(showComponentState)
const path=usePathname()
  const publicRoutes = ["/login", "/logout","/signup","/","/settings","/demo"];
  if (isLoading) {
    return <Loading />;
  }
  if ( !isValid.status && !isLoading && !publicRoutes.includes(path)) {
    return <AuthNav text={isValid.message} />;
  }
  return <>
  {showCallWindow && <CallWindow/>}
  {showCall &&  <Call/>}
  {children}</>;
};



export default Wrapper;
