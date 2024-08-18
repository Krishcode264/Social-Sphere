"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

import SendIcon from "@mui/icons-material/Send";
import "../common.css";
import CancelIcon from "@mui/icons-material/Cancel";
import { Comment, type CommentProps } from "./comment";
import { fetchCommentsForPost, token } from "@/utils/fechers";
import { userInfoState } from "@/store/selectors/user-selector";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "../basic/loading";
import { debounce } from "lodash";
import { Cookie } from "@mui/icons-material";

const CommentBox = ({
  photoId,
  handleCommentBoxVisibility,
}: {
  photoId: string;
  handleCommentBoxVisibility: () => void;
}) => {
  const { profile, id, name } = useRecoilValue(userInfoState);
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();

  const addComment = async (data: any) => {
    const t = await token();
    console.log(data, " before psodting the comment ");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/post-events/postComment`,
      {
        ...data,
        withCredentials: true,
         Cookie:t
      }
    );
    console.log(res, "res from add comment ");
  };
  // fetching comments for the post
  const {
    isPending,
    error,
    data: comments,
    isFetching,
    isSuccess: fetchingSuccess,
  } = useQuery({
    queryKey: ["comments", photoId],
    queryFn: async () => await fetchCommentsForPost(photoId),
  });

  //adding new comment and mutating it
  const {
    mutateAsync: handleAddComment,
    isPending: addingComment,
    isSuccess,
  } = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", photoId] });
    },
  });

  // closing commentobx when it goes 50-70 % above the parent scroll element
  const childRef = useRef<HTMLDivElement | null>(null);
  const [topFromVt, setTopFromVt] = useState(0);
  const [parentTop, setParentTop] = useState(0);
  useEffect(() => {
    const targetParent = childRef.current?.parentElement?.parentElement;

    if (targetParent) {
      const handleScroll = debounce(() => {
        if (childRef.current) {
          const { top, height } = childRef.current.getBoundingClientRect();
          const { top: newParentTop } = targetParent.getBoundingClientRect();

          setTopFromVt((prevTop) => (prevTop !== top ? top : prevTop));
          setParentTop((prevParentTop) =>
            prevParentTop !== newParentTop ? newParentTop : prevParentTop
          );
        }
      }, 100); // adjusting debounce here :)
      targetParent.addEventListener("scroll", handleScroll);

      return () => {
        targetParent.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);
  // 430px is the height of comment box
  useEffect(() => {
    if (topFromVt < -430 / 2 + parentTop) {
      // console.log("closing");
      handleCommentBoxVisibility();
    }
  }, [topFromVt]);

  return (
    <div
      ref={childRef}
      className="absolute h-[80%] w-[70%]  top-0 left-auto bg-slate-950   sm:w-[50%] md:w-[60%] flex-col  px-1 "
    >
      <span className="flex justify-between items-center  ">
        <p className="text-slate-200 text-xl translate-x-[-2px] m-0 p-1">
          Comments
        </p>

        <CancelIcon
          onClick={() => {
            handleCommentBoxVisibility();
          }}
          className="text-slate-300 hover:text-orange-700 hover:cursor-pointer"
        />
      </span>

      <div className="commentWrapper h-[78%] overflow-y-scroll p-2">
        {fetchingSuccess &&
          comments.map((c: CommentProps) => {
            return <Comment commentData={c} key={c._id} />;
          })}
        {fetchingSuccess && comments.length === 0 && (
          <p className="text-orange-500">Be the firstone to Comment </p>
        )}
        {isFetching && <Loading />}
        {error && (
          <p className="text-orange-700">
            something went wrong while loading comments :(
          </p>
        )}
      </div>
      <div className="bg-slate-900  w-[100%]   text-slate-700 flex  items-center rounded-lg  ">
        <input
          value={input}
          onChange={(e) => {
            setInput((prev) => e.target.value);
          }}
          type="text"
          className=" px-2 py-3 rounded-xl w-[90%] bg-inherit text-white font-mono "
          placeholder="comment something"
        />
        <button
          disabled={addingComment}
          onClick={async () => {
            if (input.trim().length > 3) {
              await handleAddComment({
                content: input,
                profile,
                name,
                photoId,
                userId: id.toString(),
              });
              setInput("");
            }
          }}
        >
          <SendIcon className="hover:text-slate-300 hover:cursor-pointer  text-2xl text-green-600" />
        </button>
      </div>
    </div>
  );
};

export default CommentBox;
