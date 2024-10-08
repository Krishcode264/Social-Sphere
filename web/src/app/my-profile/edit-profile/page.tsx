"use client";
import {
  InfoTemplate,
  InfoTemplateWithIntrests,
  InfoTemplateWithOptions,
} from "@/components/my-profile/Ui";
import { userBasicInfoState, type UserBasicInfo } from "@/store/atoms/user-atom";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { array } from "zod";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import axios from "axios";
import RotateLeftRoundedIcon from "@mui/icons-material/RotateLeftRounded";
export type UserInfoState = {
  name?: string;
  age?: number;
  email?: string;
  userName: string;
  intrests: string[];
  gender: string;
  pronouns: string;
  places_want_to_visit: string[];
  sexuality: string;
  languages_learning_or_speak: string[];
  [key: string]: string | number | string[] | undefined; // Index signature
};
const Page = () => {
  const [userInfo,setUserInfo] = useRecoilState(userBasicInfoState);
  //  console.log(userInfo,"user info at the edit profile page ")
  const [userInfoState, setUserInfoState] = useState<UserInfoState>(userInfo);
  const [updating, setUpdating] = useState(false);
  const handleUserUpdate = async () => {
    try {
      setUpdating(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/uploads/update-profile`,
        { data: userInfoState },
        {
          withCredentials: true,
        }
      );
      // console.log(res.data);
     //  console.log(userInfo,1);
     //  console.log(userInfoState,"updated state")
      setUserInfo((prev)=> ({...prev ,...userInfoState as UserBasicInfo}))
    //  console.log(userInfo,2)
      setUpdating(false);
    } catch (err) {
      console.log(err, "something went wrong");
      setUpdating(false);
    }
  };
  const handleUpdateUserInfoState = (
    property: string,
    value: string,
    remove?: boolean
  ): void => {
    setUserInfoState((prev) => {
      if (remove) {
        if (Array.isArray(prev[property])) {
          return {
            ...prev,
            [property]: (prev[property] as string[])?.filter(
              (i) => i !== value
            ),
          };
        }
      }
      if (Array.isArray(prev[property])) {
        return {
          ...prev,
          [property]: [...(prev[property] as string[]), value],
        };
      }

      return { ...prev, [property]: value };
    });
  };
  return (
    <div className="p-4 relative h-full overflow-y-scroll text-slate-300 font-mono bg-slate-900">
      <div>
        <h2 className="text-2xl relative font-semibold">Edit Profile </h2>
      </div>
      <span className="absolute bg-blue-600 top-0 right-0  py-1.5 m-2   rounded-md flex px-3 text-slate-100 cursor-pointer hover:bg-blue-700">
        {updating && <RotateLeftRoundedIcon className="animate-spin" />}
        <button
          onClick={handleUserUpdate}
          className=" h-full   rounded-md  hover:cursor-pointer  font-bold"
        >
          {updating ? "Upating profile" : " Update changes"}
        </button>
      </span>

      <span className="flex justify-between mt-5">
        <h3 className=" text-xl my-1">Personal Information</h3>
        <button
          onClick={() => setUserInfoState(userInfo)}
          className=" px-2 group flex items-center gap-1 bg-slate-800 rounded-md  hover:cursor-pointer text-orange-500 hover:text-orange-700"
        >
          <RestartAltRoundedIcon className="group-hover:animate-spin" />
          <p>Reset changes</p>
        </button>
      </span>

      <div className="flex flex-wrap">
        <InfoTemplate
          property="First name"
          id="name"
          value={userInfoState.name}
          updater={handleUpdateUserInfoState}
        />
        <InfoTemplate
          property="User name"
          id="userName"
          value={userInfoState.userName}
          updater={handleUpdateUserInfoState}
        />
        <InfoTemplate
          property="Age"
          id="age"
          value={userInfoState.age}
          updater={handleUpdateUserInfoState}
        />
        <InfoTemplate
          property="Email address"
          id="email"
          value={userInfoState.email}
          updater={handleUpdateUserInfoState}
        />
        <InfoTemplateWithOptions
          property="Gender"
          value={userInfoState.gender}
          id="gender"
          options={["Male", "Female", "Other"]}
          updater={handleUpdateUserInfoState}
        />
        <InfoTemplateWithOptions
          property="Sexuality"
          value={userInfoState.sexuality}
          id="sexuality"
          updater={handleUpdateUserInfoState}
          options={[
            "Straight",
            "Gay",
            "Lesbian",
            "Pansexual",
            "Asexual",
            "Bisexual",
            "Queer",
            "Other",
          ]}
        />
        <InfoTemplateWithOptions
          property="Pronouns"
          value={userInfoState.pronouns}
          id="pronouns"
          updater={handleUpdateUserInfoState}
          options={["He/Him", "She/Her", "They/Them"]}
        />
      </div>
      <h3 className="text-slate-300 text-xl my-1">Intrests</h3>
      <InfoTemplateWithIntrests
        intrests={userInfoState.intrests}
        editable={true}
        id="intrests"
        updater={handleUpdateUserInfoState}
      />
      <h3 className="text-slate-300 text-xl my-1">
        Languages i speak/learning
      </h3>
      <InfoTemplateWithIntrests
        intrests={userInfoState.languages_learning_or_speak}
        editable={true}
        id="languages_learning_or_speak"
        updater={handleUpdateUserInfoState}
      />

      <h3 className="text-slate-300 text-xl my-1">Places i want to visit</h3>
      <InfoTemplateWithIntrests
        intrests={userInfoState.places_want_to_visit}
        editable={true}
        id="places_want_to_visit"
        updater={handleUpdateUserInfoState}
      />
    </div>
  );
};

export default Page;
