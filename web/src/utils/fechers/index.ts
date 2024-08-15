"use server";
import type { User, UserSchemaType } from "@/types/types";
import axios from "axios";
import { cache } from "react";

export const getFeedUsers = cache(async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getFeedUsers`
    );

    return res.data;
  } catch (err) {
    return [];
  }
});

export const getUser = cache(
  async (id: string): Promise<UserSchemaType | null> => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUser`,
        { params: { id }, withCredentials: true }
      );
      console.log(res.data, "res .data in getuser");
      return res.data.user;
    } catch (err) {
      console.log("something went wron gin getuser actiom to feed/getUser");
      return null;
    }
  }
);
export const getUserPhotos = cache(async (id: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserPhotos`,
      {
        params: { id },
        withCredentials: true,
      }
    );
    // console.log(res,"user photos ")

    return res.data;
  } catch (err) {
    console.log("err in get user photos ");
    return [];
  }
});
export const getUserByToken = cache(async () => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserByToken`,
      {
        withCredentials: true,
      }
    );

    return res.data;
  } catch (err) {
    console.log("somethingwent wrong with fethching the user ");
    return null;
  }
});

export const getPhotosbyUserId = cache(async (userId: string) => {
  console.log("getPhotos running ");
  const photos = await axios.get(
    `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/feed/getUserPhotos`,
    { params: { id: userId }, withCredentials: true }
  );
  return photos.data;
});

export const fetchCommentsForPost = async (photoId: string) => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/post-events/getComments`,
    { params: { id: photoId }, withCredentials: true }
  );
  console.log(res.data)
  return res.data;
};
const handlePostComm = async (
  photoId: string,
  userId: string,
  data: any
): Promise<any | null> => {
  console.log("handlepost runnuing ");
  try {
    console.log("handlepost runnuing ");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/post-events/postComment`,
      {
        params: { photoId, userId },
        body: { content: data.input, photo: data.profile },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (e) {
    console.log("err in posting comments ");
    return null;
  }
};
