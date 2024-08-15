import axios from "axios";
import type { Dispatch, SetStateAction } from "react";

export class PostEvents {
  static socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

  static handlePostLiked = async (
    photoId: string,
    userId: string,
    handleLikeChange: (status:boolean) => void,
    liked: boolean
  ) => {
    const action = liked ? "dislike" : "like";
    try {
      console.log(action, "here is action");
      console.log(photoId, userId);
      const res = await axios.post(
        `${this.socketUrl}/post-events/liked`,
        {
          photoId,
          userId,
          action,
        },
        { withCredentials: true }
      );
       handleLikeChange(true)
     
    } catch (err) {
      handleLikeChange(false)
      console.log("something went wrong", err);
    }
  };
}