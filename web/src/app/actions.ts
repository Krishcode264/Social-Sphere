"use server";
import axios from "axios";
import { cookies } from "next/headers";
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
