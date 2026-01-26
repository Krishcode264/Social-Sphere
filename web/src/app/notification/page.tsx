"use client"
import React, { useEffect } from 'react'
import Image from 'next/image';
import i2 from '@/images/duf.webp'
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import Loading from '../loading';
import getTimeString from '@/utils/helpers/times';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { NotificationState } from '@/store/atoms/notificationState';
import Link from 'next/link';

const NotifyTemplate = ({ n }: { n: NotifyType }) => {
  const notifytext = {
    "photo-liked": "has liked your post",
    "commented": "has commented on your post",
    "friend-request": "has send you an friend request",
    "viewed-profile": "has viewed your profile"
  }
  return (
    <div className="flex  gap-3 hover:bg-slate-600 hover:cursor-pointer  p-2 rounded-md items- justify-start min-w-24 ">
      <Image
        src={n.notifier.profile || i2}
        width={30}
        height={30}
        unoptimized={true}
        alt="user"
        className="rounded-full h-8 w-8 "
      ></Image>
      <div className="flex flex-col">
        <div className="flex gap-3 flex-row">
          <Link href={`/profile/${n.notifier.id}`}>
            <p className="  text-slate-300 font-semibold text-[16px] sm:text-[14px] hover:text-orange-500">
              {n.notifier.name}
            </p>
          </Link>

          <span className="text-slate-400 text-[15px]">
            {getTimeString(n.createdAt, "en-IN")}
          </span>
        </div>
        <p className="text-slate-300  text-[16px] sm:text-[14px]">
          {notifytext[n.type]}
        </p>
      </div>
    </div>
  );
}

export type NotifyType = {
  _id: string;
  type: "photo-liked" | "commented" | "friend-request" | "viewed-profile";
  notifier: {
    id: string;
    name: string;
    profile: string;
  };

  createdAt: string;
};
const Page = () => {

  const fetchNotification = async () => {
    const token = window.sessionStorage.getItem("token");
    const notificationData = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/post-events/notification`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      // withCredentials: true // Optional: keep if you still have some cookie logic, but token is primary
    }
    );
    return notificationData.data

  }
  const {
    isPending,
    error,
    data: notifications,
    isFetching,
    isSuccess: fetchingSuccess,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => await fetchNotification(),
  });



  const renderNotifications = () => {
    return (
      notifications.map((n: NotifyType) => {
        return <NotifyTemplate n={n} key={n._id} />;
      })
    )
  }



  return (
    <div className="bg-slate-800 w-full h-[80%] sm:w-[70%]  rounded-md mx-auto my-8 p-2">
      <span className=" font-mono bg-orange-500 px-1.5 py-1.5 text-slate-200 rounded-md inline-block  mx-auto">
        Notifications
      </span>
      <div className="w-full h-[90%]  mt-2 overflow-y-scroll">
        {isFetching && <Loading />}
        {fetchingSuccess && notifications.length > 0 ? renderNotifications() : (<p className='text-slate-400'> dont have new notifications</p>)}
      </div>
    </div>
  );
}

export default Page