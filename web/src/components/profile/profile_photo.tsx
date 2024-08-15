import React from 'react'
import profilepic from '@/images/duf.webp'
import Image, { type StaticImageData } from 'next/image';
import { useRecoilState } from 'recoil';
import { userBasicInfoState, type UserBasicInfo } from '@/store/atoms/user-atom';
 import defaultUserProfile from '@/images/user-profile.png'
import AccountCircle from '@mui/icons-material/AccountCircle';

const ProfilePic = ({
  size,
  src,
  iconSize,
}: {
  size?: number;
  iconSize?: number;
  src: string | StaticImageData;
}) => {
  return (
    <div
      className={`rounded-full  mx-auto mb:w-[60px]  w-${size}  h-${size} sm:w-[50px] sm:h-[50px] mb:w-[50px] mb:h[50px]`}
      // style={{"width":size,"height":size}}
      // className={`rounded-full   w-[64px] h-[64px] xl:w-[94px] xl:h-[94px] mx-auto w-[${size}px]  h-[${size}px]`}
    >
      {src ? (
        <Image
          className="w-full h-full rounded-full   "
          src={src || defaultUserProfile}
          alt="profile pic"
          width={15}
          height={15}
          unoptimized={true}
        />
      ) : (
        // <AccountCircle
        //   sx={{ fontSize:iconSize }}
        //   className="mx-auto  border-none "
        // />
        <Image
          className="w-full h-full rounded-full "
          src={profilepic}
          alt={""}
          width={15}
          height={15}
          unoptimized={true}
        ></Image>
      )}
    </div>
  );
};

export default ProfilePic;