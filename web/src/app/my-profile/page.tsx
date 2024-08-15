"use client";
import AuthNav from "@/components/profile/auth_nav";

import { userBasicInfoState } from "@/store/atoms/user-atom";

import { useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";
import { ImageGallary } from "@/components/my-profile/Uploads";

import UserProfileView from "./useerProfileView";

const Page = () => {
  const router = useRouter();
  const userData = useRecoilValue(userBasicInfoState);

  return (
    <div className=" rounded-lg  h-full w-full">
      {userData.id ? (
        <div className="flex-col user_profile h-full w-full  lg:justify-between lg:flex-row lg:flex ">
          <div className=" bg-slate-900 lg:w-[45%] p-4 min-h-full rounded-md relative">
            <button
              onClick={() => router.push("/my-profile/edit-profile")}
              className="absolute top-0 right-0 px-2 py-1.5 bg-orange-700 rounded-md m-2 text-slate-100 hover:bg-orange-800"
            >
              Edit Profile
            </button>

            <UserProfileView />
          </div>

          <div className=" overflow-y-scroll  justify-center lg:w-[55%] bg-slate-900 h-full ">
            <ImageGallary />
          </div>
        </div>
      ) : (
        <AuthNav text="need login to see your profile :)" />
      )}
    </div>
  );
};

export default Page;
