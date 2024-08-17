"use client"
import Loading from "@/components/basic/loading";
import AuthNav from "@/components/profile/auth_nav";
import { useAuthContext } from "@/context/authContext";

import React  from "react";
  import { usePathname } from "next/navigation";
import { useRecoilValue } from "recoil";
import { userInfoState } from "@/store/selectors/user-selector";
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isValid } = useAuthContext();
   const {id}=useRecoilValue(userInfoState)
const path=usePathname()
// console.log(path)
  const publicRoutes = ["/login", "/logout","/signup","/","/settings","/notification","/demo"];
  if (isLoading) {
    return <Loading />;
  }
  if (!id && isValid.status === false && !isLoading && !publicRoutes.includes(path)) {
    return <AuthNav text={isValid.message} />;
  }
  return <>{children}</>;
};

export default Wrapper;
