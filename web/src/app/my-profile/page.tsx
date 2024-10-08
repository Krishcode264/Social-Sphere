"use client";
import AuthNav from "@/components/profile/auth_nav";

import { userBasicInfoState } from "@/store/atoms/user-atom";

import { useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";
import { ImageGallary, UploadPhoto } from "@/components/my-profile/Uploads";

import UserProfileView from "./useerProfileView";
import { userInfoState } from "@/store/selectors/user-selector";

const Page = () => {
  const router = useRouter();
  return (
    <div className=" rounded-lg  h-full w-full">
      {/* {id ? ( */}
      <div className="flex-col user_profile h-full w-full  lg:justify-between lg:flex-row lg:flex overflow-y-scroll">
        <div className=" bg-slate-900 lg:w-[45%] p-4 min-h-full rounded-md relative">
          <button
            onClick={() => router.push("/my-profile/edit-profile")}
            className="absolute top-0 right-0 px-2 py-1.5 bg-orange-700 rounded-md m-2 text-slate-100 hover:bg-orange-800"
          >
            Edit Profile
          </button>

          <UserProfileView />
        </div>

        <div className=" overflow-y-scroll flex-col items-center  lg:w-[55%] bg-slate-900  ">
          <UploadPhoto />
          <ImageGallary />
        </div>
      </div>
      {/* // ) : (
      //   <AuthNav text="need login to see your profile :)" />
      // )} */}
    </div>
  );
};

export default Page;
