import React from 'react'
import { InfoTemplateWithIntrests } from '../my-profile/Ui';
import i2 from "@/images/duf.webp";
import MaleRoundedIcon from "@mui/icons-material/MaleRounded";
import Image from "next/image";
import FemaleRoundedIcon from "@mui/icons-material/FemaleRounded";
import TransgenderRoundedIcon from "@mui/icons-material/TransgenderRounded";
import { getUser } from '@/utils/fechers';
export type Gender = "Male" | "Female" | "Other" |"Unknown";
 import Error from '../basic/Error';
import { ContactButtons } from './clientUi';

export type GuestProfileViewProps = {
  profile: string;
  name: string;
  age: number;
  gender:Gender;
  intrests: string[];
  places_want_to_visit: string[];
  userName: string;
  languages_learning_or_speak:string[],
  pronouns:string,
 sexuality:string
};
export const genderIcon={
  "Male":<MaleRoundedIcon/>,
  "Female":<FemaleRoundedIcon/>,
   "Other":<TransgenderRoundedIcon/>,
   "Unknown":""
}
export const revalidate=1; //for dev 




const GuestProfileView = async ({id}:{id:string}) => {

  const user=await getUser(id)
console.log(user,"user in guest profile view")
if (!user){
  return (
<Error tip="something went wrong fetching user data.." />
  );
}
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
          {user?.name}, {user?.age}
        </h4>
        <span className="text-orange-400 ">
          {genderIcon[user?.gender as Gender]}
        </span>
      </span>

      <ContactButtons guestId={id} friendStatus={user.friendStatus} />

      <div className="boundray  overflow-y-auto  h-[55%]">
        <span className="bg-slate-800 py-1 px-2 inline-block rounded-lg mb-3 text-slate-300">
          Introduction
        </span>
        <div className="bg-slate-700 rounded-xl p-2 text-slate-200 ">
          <span className="mt-2 font-mono ">{user.intro || ""}</span>
        </div>
        <span className="bg-slate-800 py-1 px-2 inline-block rounded-lg mb-3 text-slate-300 mt-4">
          Intrests
        </span>
        <InfoTemplateWithIntrests
          editable={false}
          intrests={user?.intrests as string[]}
        />

        <span className="bg-slate-800 py-1 px-2 inline-block rounded-lg mb-3 text-slate-300 mt-4">
          places i want to visit
        </span>
        <InfoTemplateWithIntrests
          editable={false}
          intrests={user?.places_want_to_visit as string[]}
        />
        <span className="bg-slate-800 py-1 px-2 inline-block rounded-lg mb-3 text-slate-300 mt-4">
          languages i speak/learning
        </span>
        <InfoTemplateWithIntrests
          editable={false}
          intrests={user?.languages_learning_or_speak as string[]}
        />
      </div>
    </div>
  );
}

export default GuestProfileView