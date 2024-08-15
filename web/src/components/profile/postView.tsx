"use client"
import React, {  useState } from "react";
import Image from "next/image";
import type { PhotoType } from "@/types/types";

import { ShareRounded } from "@mui/icons-material";

import CommentBar from "./commentBar";
import {  CommentButton, LikedButton } from "./clientUi";


const PostView = ({photo,userId}:{photo:PhotoType,userId?:string}) => {

 const [showCommentBox,setShowCommentBox] = useState<boolean>(false)
 
  const Caption = () => {
    return (
      <div className="caption p-2 font-mono text-xl  w-full ">
        <p className=" text-slate-400"> how is my latest photo guys ?</p>
      </div>
    );
  };
  return (
    <div
      className="postView   w-full  p-4   bg-slate-900 rounded-xl mb-4 relative "
      key={photo.id}
    >
      <Image
        src={photo.imageUrl}
        width={200}
        height={200}
        alt="user profile"
        unoptimized={true}
        className=" w-[400px] h-[400px]  bg-contain bg-center mx-auto rounded-sm "
      />
      <Caption />
      <div className="postinfo   flex gap-3 text-slate-600">
        <span>
          <LikedButton photoId={photo.id} />
          <span> 1.2k</span>
        </span>
        <span>
          <CommentButton
            photoId={photo.id}
            handleCommentBoxVisibility={setShowCommentBox}
          />
          <span> 1k</span>
        </span>
        <span>
          <ShareRounded className="text-3xl  hover:cursor-pointer hover:text-slate-400" />
          <span> 500</span>
        </span>
      </div>
      {showCommentBox && (
        <CommentBar handleCommentBoxVisibility={setShowCommentBox} photoId={photo.id} />
      )}
    

    </div>
  );
};

export default PostView;
