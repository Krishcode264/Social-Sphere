"use client";
import { PostEvents } from "@/utils/postEvents";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { userBasicInfoState } from "@/store/atoms/user-atom";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import { showComponentState } from "@/store/atoms/show-component";
import { userInfoState } from "@/store/selectors/user-selector";
import { redirect, useRouter } from "next/navigation";
export const LikedButton = ({ photoId }: { photoId: string }) => {
  const [{ likedPhotos, id }, setUser] = useRecoilState(userBasicInfoState);
  const isLiked = () => {
    return likedPhotos.filter((id) => id === photoId).length > 0;
  };

  const [liked, setLiked] = useState(isLiked());

  const handleLikeChange = (status: boolean) => {
    if (status) {
      const isLiked = likedPhotos.includes(photoId);

      const updatedLikedPhotos = isLiked
        ? likedPhotos.filter((photoid) => photoid !== photoId)
        : [...likedPhotos, photoId];

      setUser((prev) => ({
        ...prev,
        likedPhotos: updatedLikedPhotos,
      }));
      setLiked((prev) => !prev);
    }
  };
  return (
    <button
      onClick={async () => {
        if (id) {
          await PostEvents.handlePostLiked(
            photoId,
            id,
            handleLikeChange,
            liked
          );
        }
      }}
    >
      {liked ? (
        <FavoriteRoundedIcon className="text-3xl  hover:cursor-pointer text-red-500" />
      ) : (
        <FavoriteBorderRoundedIcon className="text-3xl  hover:cursor-pointer hover:text-slate-400" />
      )}
    </button>
  );
};

export const CommentButton = ({
  photoId,
  handleCommentBoxVisibility,
}: {
  photoId: string;
  handleCommentBoxVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  function handleShowComponent() {
    handleCommentBoxVisibility((prev) => !prev);
  }
  return (
    <button onClick={handleShowComponent}>
      <CommentRoundedIcon className="text-3xl  hover:cursor-pointer hover:text-slate-400" />
    </button>
  );
};

export const ContactButtons = ({ guestId }: { guestId: string }) => {
  const { id } = useRecoilValue(userInfoState);
  if (id === guestId) {
    return null;
  }
  const router = useRouter();
  return (
    <div className="flex gap-4 items-center w-full justify-center text-md my-4 ">
      <button
        type="button"
        className="text-slate-400 flex-grow bg-slate-800 px-2 py-1.5 rounded-md hover:text-slate-200 "
      >
        Send Friend Request
      </button>
      <button
        type="button"
        className="text-slate-400 flex-grow bg-slate-800  px-2 py-1.5 rounded-md hover:text-slate-200"
        onClick={()=>{
           
       router.push(`/messages/${guestId}`)}}
      >
        Message
      </button>
    </div>
  );
};
