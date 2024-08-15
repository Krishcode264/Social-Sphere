import { useRecoilValue } from "recoil";
import { userInfoState } from "../../store/selectors/user-selector";
import ProfilePic from "./profile_photo";
import Image from "next/image";
import profilepic from "../../images/profile.jpg";
import Link from "next/link";
const Profile=()=>{
     const { name, id } = useRecoilValue(userInfoState);
    
    return (
      <div className="border p-8 md:w-3/4 relative mx-auto rounded-md flex flex-col items-center gap-1 ">
        <Link href="/editProfile">
          <button className="absolute top-0 right-0 p-2 text-slate-400 mr-2 bg-gradient-to-br from-sky-800 to-blue-800  rounded-lg mt-4 tracking-wide hover:bg-slate-500 shadow-lg hover:shadow-blue-500 hover:text-rose-600">
            Edit profile
          </button>
        </Link>
        <div className="rounded-full border w-40 h-40">
          <Image
            className="w-full h-full rounded-full"
            src={profilepic}
            alt="profile pic"
          />
        </div>
        <h2 className="text-xl text-white"> {name}</h2>
            <h1 className="">info</h1>
      </div>
    );
}
export default Profile;