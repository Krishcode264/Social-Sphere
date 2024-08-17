"use client";
import { InfoTemplateWithIntrests } from "@/components/my-profile/Ui";

import i2 from "@/images/duf.webp";
import React from "react";
import { useRecoilValue } from "recoil";
import Image from "next/image";
import { userBasicInfoState } from "@/store/atoms/user-atom";
import { genderIcon } from "@/components/profile/guestProfileView";
import { Gender } from "@/components/profile/guestProfileView";



const UserProfileView = () => {
const user=useRecoilValue(userBasicInfoState)
  return (
    <div className="profileview   h-full w-full  rounded-lg  text-slate-500 font-mono">
      <Image
        src={user?.profile || i2}
        width={100}
        height={100}
        alt="user profile"
        unoptimized={true}
        className="rounded-full w-[200px] h-[200px] mx-auto mb-2"
      />

      <span className="flex justify-center ">
        <h4 className="text-xl  font-semibold text-center m-1 text-slate-400">
          {user.name}, {user.age}
        </h4>
        <span className="text-orange-400 ">
          {genderIcon[user.gender as Gender]}
        </span>
      </span>

      <div className="boundray  overflow-y-auto  h-[55%]">
        <span className="bg-slate-800 py-1 px-2 inline-block rounded-lg mb-3 text-slate-300">
          Introduction
        </span>
        <div className="bg-slate-700 rounded-xl p-2 text-slate-200 ">
          <span className="mt-2 font-mono ">
            Hello , i am krish from india, here to make new friends
          </span>
        </div>
        <span className="bg-slate-800 py-1 px-2 inline-block rounded-lg mb-3 text-slate-300 mt-4">
          Intrests
        </span>
        <InfoTemplateWithIntrests editable={false} intrests={user.intrests} />

        <span className="bg-slate-800 py-1 px-2 inline-block rounded-lg mb-3 text-slate-300 mt-4">
          places i want to visit
        </span>
        <InfoTemplateWithIntrests
          editable={false}
          intrests={user.places_want_to_visit}
        />
        <span className="bg-slate-800 py-1 px-2 inline-block rounded-lg mb-3 text-slate-300 mt-4">
          languages i speak/learning
        </span>
        <InfoTemplateWithIntrests
          editable={false}
          intrests={user.languages_learning_or_speak}
        />
      </div>
    </div>
  );
};

export default UserProfileView;
