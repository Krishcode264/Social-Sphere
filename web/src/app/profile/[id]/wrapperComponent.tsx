// "use client"
import Loading from "@/app/loading";
import AuthNav from "@/components/profile/auth_nav";
import { userInfoState } from "@/store/selectors/user-selector";

import React, { Suspense } from "react";
import { useRecoilValue } from "recoil";

const WrapperComponent = ({ children }: { children: React.ReactNode[] }) => {
      // const { id } = useRecoilValue(userInfoState);
  
  return (
    <> <Suspense fallback={<Loading />}>
        <div className="  flex-col user_profile h-full w-full  lg:justify-between lg:flex-row lg:flex  overflow-y-scroll">
          <div className="lg:w-[43%]  px-5 h-full  ">{children[0]}</div>
          <div className=" overflow-y-scroll  justify-center lg:w-[55%] h-full bg-slate-900 post_container">
            <h2 className="text-slate-300 text-2xl font-mono font-bold bg-orange-600 inline-block rounded-md px-2 py-1.5 m-2 sticky top-0 z-50">
              Posts
            </h2>
            {children[1]}
          </div>
        </div>
      </Suspense> 
  
    </>
  );

};

export default WrapperComponent;
