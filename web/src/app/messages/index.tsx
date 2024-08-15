import ProfilePic from "@/components/profile/profile_photo";
import p1 from '@/images/duf.webp'
import Image from "next/image";
export const ChatHead = () => {
  return (
    <div className="flex  items-center gap-3 bg-slate-900 hover:bg-slate-800 hover:cursor-pointer p-2 rounded-md  justify-start min-w-24 ">
   
      <Image src={p1} width={30} height={30} unoptimized={true} alt="user" className="rounded-full"></Image>
  
      <h2 className="text-xl font-semibold text-slate-400">someone</h2>
    </div>
  );
};

export const ChatHeadContainer = () => {
  return (
    <div className="p-3 overflow-y-auto flex flex-col gap-2  w-[100%] sm:w-[50%] md:w-[40%]  lg:w-[30%] xl:w-[25%]">
      <ChatHead />
      <ChatHead />
      <ChatHead />
      <ChatHead />
      <ChatHead />
      <ChatHead />
    </div>
  );
};

export const MessageTemplate = ({
  user,
  msg,
  src,
}: {
  src: string;
  user: string;
  msg: string;
}) => {
  return (
    <div className="flex  gap-3 hover:bg-slate-800 hover:cursor-pointer  p-2 rounded-md items- justify-start min-w-24 ">
 
        <Image
          src={p1}
          width={30}
          height={30}
          unoptimized={true}
          alt="user"
          className="rounded-full h-8 w-8 "
        ></Image>
      <div className="flex flex-col">
        <div className="flex gap-3 flex-row">
          <h4 className="  text-slate-500 font-semibold hover:text-slate-300">{user}</h4>
          <span className="text-slate-600 text-[15px]">1/07/2024 4:30 pm </span>
        </div>

        <p className="text-slate-300">{msg}</p>
      </div>
    </div>
  );
};
