import Loading from "@/components/basic/loading";
import GuestProfileView from "@/components/profile/guestProfileView";
import PostView from "@/components/profile/postView";
import type { PhotoType } from "@/types/types";
import { getUser } from "@/utils/fechers";

import React, { Suspense } from "react";
import { ImageGallary } from "../my-profile/Uploads";
import { useRecoilValue } from "recoil";
import { userInfoState } from "@/store/selectors/user-selector";
export const revalidate = 1300;

const GuestProfile = () => {
const user =useRecoilValue(userInfoState)
  return (

      <div className="  flex-col user_profile h-full w-full  lg:justify-between lg:flex-row lg:flex ">
        <div className="lg:w-[43%]  px-5 h-full  ">
      
        </div>
    
        

      </div>

  );
};
export default GuestProfile;
