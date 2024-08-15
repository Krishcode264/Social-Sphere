"use client"
import React from "react";
import i1 from "@/images/p1.jpeg";
import Image from "next/image";
import { useRecoilState, useRecoilValue } from "recoil";
import { showComponentState } from "@/store/atoms/show-component";
import Link from "next/link";

export type CommentProps={
  commenter:{id:string,name:string,profile?:string}
  content:string
  _id:string
}
export const Comment = ({commentData}:{commentData:CommentProps}) => {
  return (
    <div className="comment flex items-start gap-2 hover:bg-slate-800 p-2 rounded-md">
      <Image
        src={commentData.commenter?.profile || i1}
        width={30}
        height={30}
        alt="user profile"
        unoptimized={true}
        className=" rounded-full h-[40px] w-[40px] border-slate-100 outline-4  bg-contain bg-center "
      />
      <span className="text-sm text-slate-200 flex flex-col">
        <Link
          href={`/profile/${commentData.commenter.id}`}
        >
          <p className="text-slate-400 hover:text-slate-200 ">{commentData.commenter.name}</p>
        </Link>
        <span>{commentData.content}</span>
      </span>
    </div>
  );
};

  
