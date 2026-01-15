"use client"
import Image from "next/image";
import i2 from '@/images/duf.webp'
import Link from "next/link";
import { useState } from "react";
import { API } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/basic/loading";
import type { User } from "@/types/types";
import { clsx } from "clsx";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CloseIcon from '@mui/icons-material/Close';

const ActionIcons = {
  friends: <MoreVertRoundedIcon />,
  sentRequests: <MoreVertRoundedIcon />,
  friendRequests: <MoreVertRoundedIcon />,
};
export type currentListType = "friends" | "friendRequests" | "sentRequests";
const FriendListItemAction = ({ type }: { type: currentListType }) => {
  return (
    ActionIcons[type]

  )
}
const FriendListItem = ({
  u,
  type,
  refetch,
}: {
  u: User;
  type: currentListType;
  refetch: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/feed/accept-request", { requesterId: u.id });
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to discard this request?")) return;
    setLoading(true);
    try {
      await API.post("/feed/cancel-request", { targetId: u.id });
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/feed/decline-request", { requesterId: u.id });
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to unfriend this user?")) return;
    setLoading(true);
    try {
      await API.post("/feed/unfriend", { friendId: u.id });
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group flex gap-3 items-center hover:bg-slate-800 p-2 rounded-md items- justify-start min-w-24 transition-colors duration-200">
      <Link href={`/profile/${u.id}`}>
        <Image
          src={u.profile || i2}
          width={40}
          height={40}
          unoptimized={true}
          alt="user"
          className="rounded-full h-10 w-10 object-cover"
        ></Image>
      </Link>
      <div className="flex flex-col">
        <div className="">
          <Link href={`/profile/${u.id}`}>
            <p className="text-slate-300 font-semibold text-[16px] sm:text-[14px] hover:text-orange-500 transition-colors">
              {u.name}
            </p>
          </Link>
        </div>
      </div>
      <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {type === "friendRequests" && (
          <>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              disabled={loading}
              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Decline
            </button>
          </>
        )}
        {type === "sentRequests" && (
          <button
            onClick={handleDiscard}
            disabled={loading}
            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Discard
          </button>
        )}
        {type === "friends" && (
          <button
            onClick={handleUnfriend}
            disabled={loading}
            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Unfriend
          </button>
        )}
      </div>
    </div>
  );
};

const FriendListItemActionBar = () => {
  return (
    <div className="border">

    </div>
  )
}

const Page = () => {

  type FriendListItomType = {
    name: string;
    profile: string;
    id: string
  }


  const [currentList, setCurrentList] = useState<currentListType>("friends")

  const fetchList = async () => {
    const userListdata = await API.get(
      `/feed/relationlist/?type=${currentList}`
    );

    return userListdata.data;
  };


  const {
    isPending,
    error,
    data: userList,
    isFetching,
    isSuccess: fetchingSuccess,
    refetch,
  } = useQuery({
    queryKey: [currentList],
    queryFn: async () => await fetchList(),
  });



  const renderUserList = () => {
    return userList.map((u: User) => {
      return (
        <FriendListItem
          u={u}
          key={u.id}
          type={currentList}
          refetch={refetch}
        />
      );
    });
  };
  return (
    <>
      <div className=" w-full  bg-slate-900   gap-3  p-2  h-full  font-mono">
        <div className="w-full mx-auto  md:w-[70%] my-5">
          <div
            className="w-full flex flex-col gap-2     "
            style={{
              alignItems:
                currentList === "friends"
                  ? "start"
                  : currentList === "friendRequests"
                    ? "center"
                    : "end",
            }}
          >
            <div className="w-full flex gap-2 justify-between  px-2 text-slate-300 ">
              <button
                className={`${clsx(
                  currentList === "friends"
                    ? "active-list text-orange-500 "
                    : ""
                )}`}
                onClick={(e) => setCurrentList("friends")}
              >
                Friends
              </button>
              <button
                className={`${clsx(
                  currentList === "friendRequests"
                    ? "active-list text-orange-500 "
                    : ""
                )}`}
                onClick={(e) => setCurrentList("friendRequests")}
              >
                Incoming Requests
              </button>
              <button
                className={`${clsx(
                  currentList === "sentRequests"
                    ? "active-list text-orange-500 "
                    : ""
                )}`}
                onClick={(e) => setCurrentList("sentRequests")}
              >
                Sent Requests
              </button>
            </div>

            {/* <div
              className="absolute bottom-0 h-[2px] bg-orange-500 transition-all duration-300"
              style={{ width: `${currentList.length * 10}px` }}
            ></div> */}
            {/* <div
              className="border w-44 border-orange-500 transition-all duration-300  "
              style={{ width: `${currentList.length * 9}px` }}
            ></div> */}
          </div>
          <div className="w-full h-[90%]  mt-4 overflow-y-scroll">
            {isFetching && <Loading />}
            {fetchingSuccess && userList.length > 0 ? (
              renderUserList()
            ) : (
              <p className="text-slate-300"> dont have anyone </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
