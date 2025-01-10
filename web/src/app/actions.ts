"use server";
import { API } from "@/utils/axios";
import { cache } from "react";

export const getFeedUsers = cache(async () => {
  try {
    const res = await API.get("/api/feed/getFeedUsers");

    return res.data;
  } catch (err) {
    console.log("error in get feedusers");
    return [];
  }
});
